import { Router } from "express";
import { createCustomer, getCustomers, getCustomerById, updateCustomer, addFollowUpNote } from "../controllers/customerController";
import { protect, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { body } from "express-validator";

const router = Router();

const customerValidation = [
  body("customerName").trim().notEmpty().withMessage("Customer name is required"),
  body("mobileNumber").trim().notEmpty().withMessage("Mobile number is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("businessName").trim().notEmpty().withMessage("Business name is required"),
  body("customerType").isIn(["Retail", "Wholesale", "Distributor"]).withMessage("Invalid customer type"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("status").isIn(["Lead", "Active", "Inactive"]).withMessage("Invalid status"),
];

const followUpValidation = [
  body("note").trim().notEmpty().withMessage("Note is required"),
];

router.use(protect);

router.route("/")
  .get(authorize("admin", "sales", "accounts"), getCustomers)
  .post(authorize("admin", "sales"), validate(customerValidation), createCustomer);

router.route("/:id")
  .get(authorize("admin", "sales", "accounts"), getCustomerById)
  .put(authorize("admin", "sales"), updateCustomer);

router.post("/:id/follow-up", authorize("admin", "sales"), validate(followUpValidation), addFollowUpNote);

export default router;
