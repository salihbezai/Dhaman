import { Router } from "express";
import { protect, adminOnly } from '../middlewares/authMiddleware';
import { addNewUser, setUserInactif, updateMemberInfo } from "../controllers/userController";

const router = Router();

router.post("/add", protect,adminOnly,addNewUser);

// set user inactif
router.put("/member/inactif/:id", protect,adminOnly,setUserInactif);

// update member info by admin
 router.put("/member/update/:id",protect,adminOnly,updateMemberInfo);



export default router;