import { Router } from "express";
import { protect, adminOnly } from '../middlewares/authMiddleware';
import { addNewUser, setUserActif, setUserInactif, updateMemberInfo, updateUserInfo } from "../controllers/userController";

const router = Router();

router.post("/add", protect,adminOnly,addNewUser);

// set user inactif
router.put("/member/inactif/:id", protect,adminOnly,setUserInactif);

// set user actif
router.put("/member/actif/:id", protect,adminOnly,setUserActif);

// update member info by admin
 router.put("/member/update/:id",protect,adminOnly,updateMemberInfo);

 // update user info
 router.put("/update/:id",protect,updateUserInfo);



export default router;