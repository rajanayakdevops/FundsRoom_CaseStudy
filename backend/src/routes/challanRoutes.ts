import { Router } from "express";
import { createChallan, getChallans, getChallanById, updateChallanStatus } from "../controllers/challanController";
import { protect, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { body } from "express-validator";

const router = Router();

const challanValidation = [
  body("customerId").notEmpty().withMessage("Customer ID is required"),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("items.*.productId").notEmpty().withMessage("Product ID is required for each item"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1 for each item"),
  body("status").isIn(["Draft", "Confirmed"]).withMessage("Status must be Draft or Confirmed"),
];

const statusValidation = [
  body("status").isIn(["Confirmed", "Cancelled"]).withMessage("Status must be Confirmed or Cancelled"),
];

router.use(protect);

router.route("/")
  .get(authorize("admin", "sales", "accounts"), getChallans)
  .post(authorize("admin", "sales"), validate(challanValidation), createChallan);

router.route("/:id")
  .get(authorize("admin", "sales", "accounts"), getChallanById);

router.patch("/:id/status", authorize("admin", "sales"), validate(statusValidation), updateChallanStatus);

export default router;
