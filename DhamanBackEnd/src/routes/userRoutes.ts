import { Router } from "express";
import { protect, adminOnly } from '../middlewares/authMiddleware';
import { addNewUser } from "../controllers/userController";

const router = Router();

router.post("/add", protect,adminOnly,addNewUser);




export default router;