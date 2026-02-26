import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, UserRole } from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { logger } from "../utility";
import { generateAccessToken, generateRefreshToken } from "../helper";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "%%pea8401847§%£µouhfjemakncjfkgi";

interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}
export interface UpdateRequestBody {
  id?: string;
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  profileImageUrl?: string;
}

export interface JWTPayload {
  id: string;
  role: UserRole;
}

interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  role: UserRole;
}

export const register = async (req: Request, res: Response) => {
  const { username, email, password, phone, role } =
    req.body as RegisterRequestBody;

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

    const accessToken = generateAccessToken(
      newUser._id.toString(),
      newUser.role,
    );
    const token = generateRefreshToken(newUser._id.toString());
    newUser.refreshTokens.push({
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await newUser.save();

    // respond with user data and token
    const user: RegisterResponse = {
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      profileImageUrl: newUser.profileImageUrl,
      role: newUser.role,
    };
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(201).json({ user, token: accessToken, refreshToken: token });
  } catch (error) {
    const err = error as Error;
    logger.error({
      message: "Error during registration",
      error: err.message,
      stack: err.stack,
      route: req.originalUrl,
    });
    res
      .status(500)
      .json({
        message: {
          en: "Server error during registration.",
          ar: "خطأ في الخادم أثناء التسجيل.",
        },
      });
  }
};

interface LoginRequestBody {
  email?: string;
  username?: string;
  password: string;
}

interface LoginResponse {
  id: string;
  username: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  role: UserRole.SUPERVISOR | UserRole.CONFIRMER | UserRole.DRIVER;
}

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body as LoginRequestBody;
  console.log("trying to login with " + JSON.stringify(req.body));
  // validate required fields
  if (!username || !password) {
    return res.status(400).json({
      message: {
        en: "Username and password are required.",
        ar: "اسم المستخدم وكلمة المرور مطلوبان.",
      },
    });
  }
  try {
    // find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        message: {
          en: "Invalid username or password.",
          ar: "خطأ في اسم المستخدم أو كلمة المرور.",
        },
      });
    }

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
      return res.status(401).json({
        message: {
          en: "Invalid username or password.",
          ar: "خطأ في اسم المستخدم أو كلمة المرور.",
        },
      });
    }
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // save refresh token to db
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    // respond with user data and token
    const response: LoginResponse = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      phone: user.phone,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
    };
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ user: response, token: accessToken, refreshToken });
  } catch (error) {
    logger.error({
      message: "Error during login",
      error: (error as Error).message,
      stack: (error as Error).stack,
      route: req.originalUrl,
    });
    res.status(500).json({
      message: {
        en: "Server error during login.",
        ar: "خطأ في الخادم أثناء تسجيل الدخول.",
      },
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    console.log("called");
    const GRACE_MS = 30 * 1000; // 30 seconds grace
    const REFRESH_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

    const oldToken = req.body.token;
    if (!oldToken) {
      return res.status(401).json({
        message: {
          en: "You are not logged in, please log in and try again.",
          ar: "أنت غير مسجل دخولك، يرجى تسجيل الدخول والمحاولة مرة أخرى.",
        },
      });
    }

    //  Verify JWT signature
    let payload: JWTPayload;
    try {
      payload = jwt.verify(oldToken, JWT_SECRET) as JWTPayload;
    } catch {
      return res.status(401).json({
        message: {
          en: "You are not logged in, please log in and try again.",
          ar: "أنت غير مسجل دخولك، يرجى تسجيل الدخول والمحاولة مرة أخرى.",
        },
      });
    }

    //  Find user containing this refresh token
    const user = await User.findOne(
      { refreshTokens: { $elemMatch: { token: oldToken } } },
      { password: 0 },
    );

    if (!user) {
      return res.status(401).json({
        message: {
          en: "You are not logged in, please log in and try again.",
          ar: "أنت غير مسجل دخولك، يرجى تسجيل الدخول والمحاولة مرة أخرى.",
        },
      });
    }
    //  Validate token & grace period
    const now = new Date();
    const storedToken = user.refreshTokens.find(
      (t) => t.token === oldToken && t.expiresAt > now,
    );

    if (!storedToken) {
      //  Token has expired or reused
      user.refreshTokens = [];
      await user.save();
      return res.status(403).json({
        message: {
          en: "Unauthorized",
          ar: "دخول غير مصرح به",
        },
      });
    }

    //  Rotate token
    const newRefreshToken = generateRefreshToken(user._id.toString());
    const accessToken = generateAccessToken(user._id.toString(), user.role);

    //  Mark old token to expire soon (GRACE)
    user.refreshTokens = user.refreshTokens.map((t) =>
      t.token === oldToken
        ? { ...t, expiresAt: new Date(Date.now() + GRACE_MS) }
        : t,
    );

    //  Add new refresh token
    user.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + REFRESH_LIFETIME_MS),
    });

    //  Cleanup expired tokens
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.expiresAt > new Date(),
    );

    await user.save();

    //  Set cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    //  Respond
    res.status(200).json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        phone: user.phone,
        role: user.role,
      },
      token: accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error({
      message: "Error during refresh",
      error: (error as Error).message,
      stack: (error as Error).stack,
      route: req.originalUrl,
    });
    res
      .status(500)
      .json({ message: { en: "Server error", ar: "خطاء في الخادم" } });
  }
};

// get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: { en: "User not found.", ar: "المستخدم غير موجود." },
      });
    }
    res.status(200).json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error({
      message: "Error getting user profile",
      error: (error as Error).message,
      stack: (error as Error).stack,
      route: req.originalUrl,
    });
    res.status(500).json({
      message: {
        en: "Server error getting user profile.",
        ar: "خطاء في الخادم أثناء جلب بيانات المستخدم.",
      },
    });
  }
};

// update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const updateData = req.body as Partial<UpdateRequestBody>;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    console.log("the udpate data " + JSON.stringify(updateData));
    if (!user) {
      return res.status(404).json({
        message: { en: "User not found.", ar: "المستخدم غير موجود." },
      });
    }
    res.status(200).json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error({
      message: "Error updating user profile",
      error: (error as Error).message,
      stack: (error as Error).stack,
      route: req.originalUrl,
    });
    res.status(500).json({
      message: {
        en: "Server error updating user profile.",
        ar: "خطاء في الخادم أثناء تحديث بيانات المستخدم.",
      },
    });
  }
};

// logout user
export const logout = async (req: Request, res: Response) => {
  const token = req.body.token;
  // find the user by token
  if (token) {
    const user = await User.findOne({
      refreshTokens: { $elemMatch: { token } },
    });

    if (user) {
      // delete refresh token from db
      user.refreshTokens = user.refreshTokens.filter(
        (refreshToken) => refreshToken.token !== token,
      );
      await user.save();
    }
    res.clearCookie("refreshToken");
    res.status(200).json({
      message: { en: "Logout successful.", ar: "تم تسجيل الخروج بنجاح." },
    });
  }
};
