import { Response } from "express";
import Customer from "../models/Customer";
import { AuthRequest } from "../middleware/auth";

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  const customer = await Customer.create({ ...req.body, createdBy: req.user!._id });
  res.status(201).json(customer);
};

export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (req.query.search) {
    filter.$text = { $search: req.query.search as string };
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.customerType) {
    filter.customerType = req.query.customerType;
  }

  const total = await Customer.countDocuments(filter);
  const customers = await Customer.find(filter)
    .populate("createdBy", "name role")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({ customers, page, limit, total });
};

export const getCustomerById = async (req: AuthRequest, res: Response): Promise<void> => {
  const customer = await Customer.findById(req.params.id).populate("createdBy", "name role").populate("followUpNotes.createdBy", "name role");

  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  res.status(200).json(customer);
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  res.status(200).json(customer);
};

export const addFollowUpNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  customer.followUpNotes.push({
    note: req.body.note,
    createdBy: req.user!._id,
    createdAt: new Date(),
  });

  await customer.save();

  res.status(201).json(customer);
};
