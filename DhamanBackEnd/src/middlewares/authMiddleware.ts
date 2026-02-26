import { NextFunction, Request, Response } from "express";
import { JWTPayload } from "../controllers/authController";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { logger } from "../utility";
import { UserRole } from "../models/User";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: {
        en: "No token, authorization denied",
        ar: "لا يوجد توكن، تم رفض الصلاحية",
      },
    });
  }

  const token = authHeader.split(" ")[1];
  if (token === undefined || token === null)
    return res
      .status(401)
      .json({
        message: {
          en: "No token, authorization denied",
          ar: "لا يوجد توكن، تم رفض الصلاحية",
        },
      });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error({
      message: "Error verifying token",
      error: (error as Error).message,
      stack: (error as Error).stack,
      route: req.originalUrl,
    });
    return res.status(401).json({ message: {en:"Token is not valid", ar:"التوكن غير صحيح"} });
  }
};

// admine only access middleware

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.SUPERVISOR)
    return res.status(403).json({ message: {en:"Admins only", ar:"فقط المشرفين مسموح لهم بالدخول"} });
  next();
};


export const confirmerOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.CONFIRMER)
    return res.status(403).json({ message: {en:"Confirmer only", ar:"فقط المؤكدين مسموح لهم بالدخول"} });
  next();
};
