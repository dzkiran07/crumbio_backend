import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);
router.post("/forgot-password/send-otp", authController.sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", authController.verifyForgotPasswordOtp);
router.post("/forgot-password/reset", authController.resetForgotPassword);

export default router;
