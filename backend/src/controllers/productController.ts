import { Response } from "express";
import Product from "../models/Product";
import StockMovement from "../models/StockMovement";
import { AuthRequest } from "../middleware/auth";

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const existingProduct = await Product.findOne({ sku: req.body.sku.toUpperCase() });

  if (existingProduct) {
    res.status(400).json({ message: "Product with this SKU already exists" });
    return;
  }

  const product = await Product.create({ ...req.body, createdBy: req.user!._id });
  res.status(201).json(product);
};

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { isActive: true };

  if (req.query.search) {
    filter.$text = { $search: req.query.search as string };
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("createdBy", "name role")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({ products, page, limit, total });
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id).populate("createdBy", "name role");

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  res.status(200).json(product);
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  res.status(200).json(product);
};

export const getLowStockProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ["$currentStock", "$minimumStockAlert"] },
  });

  res.status(200).json(products);
};
