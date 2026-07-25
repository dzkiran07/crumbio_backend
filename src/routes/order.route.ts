import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { adminMiddleware, bakerMiddleware } from "../middleware/admin.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", orderController.createOrder);
router.get("/mine", orderController.listMyOrders);
router.get("/baker", bakerMiddleware, orderController.listBakerOrders);
router.get("/admin/all", adminMiddleware, orderController.listAllOrders);
router.get("/:id", orderController.getOrder);
router.patch("/:id/status", bakerMiddleware, orderController.updateOrderStatus);

export default router;
