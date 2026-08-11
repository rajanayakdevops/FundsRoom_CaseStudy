import { Response } from "express";
import Challan from "../models/Challan";
import Product from "../models/Product";
import StockMovement from "../models/StockMovement";
import { AuthRequest } from "../middleware/auth";

const generateChallanNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await Challan.countDocuments();
  const padded = String(count + 1).padStart(4, "0");
  return `CH-${year}-${padded}`;
};

export const createChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  const { customerId, items, status } = req.body;

  const productIds = items.map((item: { productId: string }) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== items.length) {
    res.status(404).json({ message: "One or more products not found" });
    return;
  }

  if (status === "Confirmed") {
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) {
        res.status(404).json({ message: `Product not found` });
        return;
      }
      if (product.currentStock < item.quantity) {
        res.status(400).json({
          message: `Insufficient stock for ${product.sku}. Available: ${product.currentStock}, requested: ${item.quantity}`,
        });
        return;
      }
    }

    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId)!;
      product.currentStock -= item.quantity;
      await product.save();

      await StockMovement.create({
        product: item.productId,
        quantityChanged: item.quantity,
        movementType: "OUT",
        reason: `Sales Challan`,
        createdBy: req.user!._id,
      });
    }
  }

  const challanItems = items.map((item: { productId: string; quantity: number }) => {
    const product = products.find((p) => p._id.toString() === item.productId)!;
    return {
      productId: product._id,
      productName: product.productName,
      sku: product.sku,
      unitPrice: product.unitPrice,
      quantity: item.quantity,
    };
  });

  const totalQuantity = challanItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
  const challanNumber = await generateChallanNumber();

  const challan = await Challan.create({
    challanNumber,
    customer: customerId,
    items: challanItems,
    totalQuantity,
    status: status || "Draft",
    createdBy: req.user!._id,
  });

  res.status(201).json(challan);
};

export const getChallans = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.customerId) {
    filter.customer = req.query.customerId;
  }

  const total = await Challan.countDocuments(filter);
  const challans = await Challan.find(filter)
    .populate("customer", "customerName businessName")
    .populate("createdBy", "name role")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({ challans, page, limit, total });
};

export const getChallanById = async (req: AuthRequest, res: Response): Promise<void> => {
  const challan = await Challan.findById(req.params.id)
    .populate("customer", "customerName businessName mobileNumber email")
    .populate("createdBy", "name role");

  if (!challan) {
    res.status(404).json({ message: "Challan not found" });
    return;
  }

  res.status(200).json(challan);
};

export const updateChallanStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  const challan = await Challan.findById(req.params.id);

  if (!challan) {
    res.status(404).json({ message: "Challan not found" });
    return;
  }

  if (challan.status === "Confirmed") {
    res.status(400).json({ message: "Confirmed challan cannot be modified" });
    return;
  }

  if (challan.status === "Cancelled") {
    res.status(400).json({ message: "Cancelled challan cannot be modified" });
    return;
  }

  if (status === "Confirmed") {
    const productIds = challan.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    for (const item of challan.items) {
      const product = products.find((p) => p._id.toString() === item.productId.toString());
      if (!product) {
        res.status(404).json({ message: `Product not found` });
        return;
      }
      if (product.currentStock < item.quantity) {
        res.status(400).json({
          message: `Insufficient stock for ${product.sku}. Available: ${product.currentStock}, requested: ${item.quantity}`,
        });
        return;
      }
    }

    for (const item of challan.items) {
      const product = products.find((p) => p._id.toString() === item.productId.toString())!;
      product.currentStock -= item.quantity;
      await product.save();

      await StockMovement.create({
        product: item.productId,
        quantityChanged: item.quantity,
        movementType: "OUT",
        reason: `Sales Challan ${challan.challanNumber}`,
        createdBy: req.user!._id,
      });
    }
  }

  challan.status = status;
  await challan.save();

  res.status(200).json(challan);
};
