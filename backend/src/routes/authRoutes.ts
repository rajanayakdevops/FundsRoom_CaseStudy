import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { protect, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { body } from "express-validator";

const router = Router();

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["admin", "sales", "warehouse", "accounts"]).withMessage("Invalid role"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", protect, authorize("admin"), validate(registerValidation), register);
router.post("/login", validate(loginValidation), login);
router.get("/me", protect, getMe);

export default router;
