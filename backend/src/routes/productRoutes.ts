import { Router } from "express";
import { createProduct, getProducts, getProductById, updateProduct, getLowStockProducts } from "../controllers/productController";
import { protect, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { body } from "express-validator";

const router = Router();

const productValidation = [
  body("productName").trim().notEmpty().withMessage("Product name is required"),
  body("sku").trim().notEmpty().withMessage("SKU is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("unitPrice").isFloat({ min: 0 }).withMessage("Unit price must be a valid positive number"),
  body("currentStock").isInt({ min: 0 }).withMessage("Current stock must be a valid positive number"),
  body("minimumStockAlert").isInt({ min: 0 }).withMessage("Minimum stock alert must be a valid positive number"),
  body("location").trim().notEmpty().withMessage("Location is required"),
];

router.use(protect);

router.get("/low-stock", authorize("admin", "warehouse", "sales"), getLowStockProducts);

router.route("/")
  .get(authorize("admin", "warehouse", "sales", "accounts"), getProducts)
  .post(authorize("admin", "warehouse"), validate(productValidation), createProduct);

router.route("/:id")
  .get(authorize("admin", "warehouse", "sales", "accounts"), getProductById)
  .put(authorize("admin", "warehouse"), updateProduct);

export default router;
