
import { Request } from "express";
import { UserRole } from "../../models/User";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      role: UserRole;
    };
  }
}