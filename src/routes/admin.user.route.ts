import { Router } from "express";
import * as adminUserController from "../controllers/admin.user.controller";
import { adminMiddleware } from "../middleware/admin.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/", adminUserController.listUsers);
router.patch("/:id/status", adminUserController.updateUserStatus);

export default router;
