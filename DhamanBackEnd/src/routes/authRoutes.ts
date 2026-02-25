import { Router } from "express";
import {
  getUserProfile,
  login,
  logout,
  refresh,
  register,
  updateUserProfile,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getUserProfile);
router.post("/refresh", refresh);
router.put("/profile", protect, updateUserProfile);
router.post("/logout", logout);



export default router;