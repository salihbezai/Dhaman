import { Router } from "express";
import {
  getUserProfile,
  login,
  logout,
  refresh,
  register,
  updateUserProfile,
} from "../controllers/authController";
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = Router();

router.post("/register", protect,adminOnly,register);
router.post("/login", login);
router.get("/me", protect, getUserProfile);
router.post("/refresh", refresh);
router.put("/profile", protect, updateUserProfile);
router.post("/logout", logout);



export default router;