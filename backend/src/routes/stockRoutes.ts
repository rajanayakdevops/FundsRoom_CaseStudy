import { Router } from "express";
import { addStockMovement, getStockMovements } from "../controllers/stockController";
import { protect, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { body } from "express-validator";

const router = Router();

const stockMovementValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantityChanged").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("movementType").isIn(["IN", "OUT"]).withMessage("Movement type must be IN or OUT"),
  body("reason").trim().notEmpty().withMessage("Reason is required"),
];

router.use(protect);

router.route("/")
  .get(authorize("admin", "warehouse", "accounts"), getStockMovements)
  .post(authorize("admin", "warehouse"), validate(stockMovementValidation), addStockMovement);

export default router;
