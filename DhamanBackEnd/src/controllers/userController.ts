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
  wilaya: string;
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
  wilaya: string;
  isActive: boolean;
}

export const addNewUser = async (req: Request, res: Response) => {
  const { username, email, password, phone, role, wilaya } = req.body
    .formdata as NewUserRequestBody;
  console.log("the body is " + JSON.stringify(req.body));

  // validate required fields
  if (!username || !email || !password || !phone || !role || !wilaya) {
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
      wilaya
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
      isActive: newUser.isActive,
      wilaya: newUser.wilaya
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
  const { id } = req.params;
  console.log("the id " + id);
  try {
    const user = await User.findById(id).select("-password -refreshTokens");
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

    res.status(200).json({ user });
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
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password -refreshTokens");
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

    res.status(200).json({ user });
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
};

export const updateMemberInfo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, phone, role } = req.body;
  try {
    const user = await User.findById(id).select("-password -refreshTokens");
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
    user.role = role;
    await user.save();

    res.status(200).json({ user });
  } catch (error) {
    console.log("the error "+error)
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

// update user info password and username
export const updateUserInfo = async (req: Request, res: Response) => {
  const { username, currentPassword, newPassword, email, phone } = req.body;
  const { id } = req.params;

  try {
    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: {
          en: "User not found.",
          ar: "المستخدم غير موجود.",
        },
      });
    }

    if (!currentPassword) {
      return res.status(400).json({
        message: {
          en: "Current password is required.",
          ar: "كلمة المرور الحالية مطلوبة.",
        },
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password!,
    );
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: {
          en: "Current password is incorrect.",
          ar: "كلمة المرور الحالية غير صحيحة.",
        },
      });
    }

    // see if username already exist  and is not the current user
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== id) {
      return res.status(400).json({
        message: {
          en: "Username already exists.",
          ar: "اسم المستخدم موجود بالفعل.",
        },
      });
    }
    // check if email already exist  and is not the current user
    const existingEmail = await User.findOne({ email });
    if (existingEmail && existingEmail._id.toString() !== id) {
      return res.status(400).json({
        message: {
          en: "Email already exists.",
          ar: "البريد الإلكتروني موجود بالفعل.",
        },
      });
    }
    // check if phone already exist  and is not the current user
    const existingPhone = await User.findOne({ phone });
    if (existingPhone && existingPhone._id.toString() !== id) {
      return res.status(400).json({
        message: {
          en: "Phone already exists.",
          ar: "رقم الهاتف موجود بالفعل.",
        },
      });
    }
    user.username = username;
    user.email = email;
    user.phone = phone;
    if (newPassword && newPassword.trim() !== "") {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();
    user = await User.findById(id).select("-password -refreshTokens");
    res.status(200).json({ user });
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
