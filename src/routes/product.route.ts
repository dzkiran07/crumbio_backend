import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { bakerMiddleware } from "../middleware/admin.middleware";
import { uploadImage } from "../middleware/multer.middleware";

const router = Router();

router.get("/", productController.listProducts);
router.get("/:id", productController.getProduct);

router.post("/", authMiddleware, bakerMiddleware, productController.createProduct);
router.patch("/:id", authMiddleware, bakerMiddleware, productController.updateProduct);
router.delete("/:id", authMiddleware, bakerMiddleware, productController.deleteProduct);
router.post(
  "/:id/image",
  authMiddleware,
  bakerMiddleware,
  uploadImage.single("image"),
  productController.uploadProductImage
);

export default router;
