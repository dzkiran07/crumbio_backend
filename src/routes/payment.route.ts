import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/khalti/initiate", paymentController.initiateKhalti);
router.post("/khalti/verify", paymentController.verifyKhalti);

export default router;
