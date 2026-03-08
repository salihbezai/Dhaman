import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, UserRole } from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { logger } from "../utility";
import { generateAccessToken, generateRefreshToken } from "../helper";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "%%pea8401847§%£µouhfjemakncjfkgi";

interface NewUserRequestBody {
  username: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface JWTPayload {
  id: string;
  role: UserRole;
}

interface NewUserResponseBody {
  id: string;
  username: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  role: UserRole;
}

export const addNewUser = async (req: Request, res: Response) => {
  const { username, email, password, phone, role } =
    req.body.formdata as NewUserRequestBody;
    console.log("the body is "+JSON.stringify(req.body))

  // validate required fields
  if (!username || !email || !password || !phone || !role) {
    return res.status(400).json({
      message: {
        en: "All fields (username, email, password, phone, role) are required.",
        ar: "جميع الحقول (اسم المستخدم، البريد الإلكتروني، كلمة المرور، رقم الهاتف، الصلاحية) مطلوبة.",
      },
    });
  }
  try {
    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: {
          en: "User with this email already exists.",
          ar: "المستخدم مع هذا البريد الإلكتروني موجود بالفعل.",
        },
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
      profileImageUrl: `https://res.cloudinary.com/ddosc8sso/image/upload/v1772004959/profile_b9wucv.jpg`,
      role,
    });

    await newUser.save();

    // respond with user data and token
    const user: NewUserResponseBody = {
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      profileImageUrl: newUser.profileImageUrl,
      role: newUser.role,
    };

    res.status(201).json({ user });
  } catch (error) {
    const err = error as Error;
    logger.error({
      message: "Error during creating new user",
      error: err.message,
      stack: err.stack,
      route: req.originalUrl,
    });
    res.status(500).json({
      message: {
        en: "Server error during creating new user.",
        ar: "خطأ في الخادم أثناء انشاء مستخدم جديد.",
      },
    });
  }
};


export const setUserInactif = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-password -refreshTokens");
    if (!user) {
      return res.status(404).json({
        message: {
          en: "User not found.",
          ar: "المستخدم غير موجود.",
        },
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({user});
  } catch (error) {
    const err = error as Error;
    logger.error({
      message: "Error during setting user inactif",
      error: err.message,
      stack: err.stack,
      route: req.originalUrl,
    });
    res.status(500).json({
      message: {
        en: "Server error during setting user inactif.",
        ar: "خطاء في الخادم اثناء تعطيل المستخدم.",
      },
    });
  }
};

// set user actif
export const setUserActif = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-password -refreshTokens");
    if (!user) {
      return res.status(404).json({
        message: {
          en: "User not found.",
          ar: "المستخدم غير موجود.",
        },
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({user});
  } catch (error) {
    const err = error as Error;
    logger.error({
      message: "Error during setting user actif",
      error: err.message,
      stack: err.stack,
      route: req.originalUrl,
    });
    res.status(500).json({
      message: {
        en: "Server error during setting user actif.",
        ar: "خطاء في الخادم اثناء تفعيل المستخدم.",
      },
    });
  }
}

export const updateMemberInfo = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { username, email, phone } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: {
          en: "User not found.",
          ar: "المستخدم غير موجود.",
        },
      });
    }

    user.username = username;
    user.email = email;
    user.phone = phone;
    await user.save();

    res.status(200).json({
      message: {
        en: "User info updated successfully.",
        ar: "تم تحديث معلومات المستخدم بنجاح.",
      },
    });
  } catch (error) {
    const err = error as Error;
    logger.error({
      message: "Error during updating user info",
      error: err.message,
      stack: err.stack,
      route: req.originalUrl,
    });
    res.status(500).json({
      message: {
        en: "Server error during updating user info.",
        ar: "خطاء في الخادم اثناء تحديث معلومات المستخدم.",
      },
    });
  }
};