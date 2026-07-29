import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadImage } from "../middleware/multer.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);
router.patch("/me", authMiddleware, authController.updateMe);
router.post("/me/image", authMiddleware, uploadImage.single("image"), authController.uploadProfileImage);
router.patch("/change-password", authMiddleware, authController.changePassword);
router.delete("/me", authMiddleware, authController.deleteAccount);

export default router;
