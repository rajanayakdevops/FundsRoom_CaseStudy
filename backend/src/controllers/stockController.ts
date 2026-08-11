import { Response } from "express";
import Product from "../models/Product";
import StockMovement from "../models/StockMovement";
import { AuthRequest } from "../middleware/auth";

export const addStockMovement = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, quantityChanged, movementType, reason } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  if (movementType === "OUT") {
    if (product.currentStock < quantityChanged) {
      res.status(400).json({
        message: `Insufficient stock for ${product.sku}. Available: ${product.currentStock}, requested: ${quantityChanged}`,
      });
      return;
    }
    product.currentStock -= quantityChanged;
  } else {
    product.currentStock += quantityChanged;
  }

  await product.save();

  const movement = await StockMovement.create({
    product: productId,
    quantityChanged,
    movementType,
    reason,
    createdBy: req.user!._id,
  });

  res.status(201).json(movement);
};

export const getStockMovements = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (req.query.productId) {
    filter.product = req.query.productId;
  }

  if (req.query.movementType) {
    filter.movementType = req.query.movementType;
  }

  const total = await StockMovement.countDocuments(filter);
  const movements = await StockMovement.find(filter)
    .populate("product", "productName sku")
    .populate("createdBy", "name role")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({ movements, page, limit, total });
};
