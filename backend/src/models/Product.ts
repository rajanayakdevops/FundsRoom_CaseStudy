import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlert: number;
  location: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    category: { type: String, required: true, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    currentStock: { type: Number, required: true, min: 0, default: 0 },
    minimumStockAlert: { type: Number, required: true, min: 0, default: 10 },
    location: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

productSchema.index({ productName: "text", sku: "text", category: "text" });

export default mongoose.model<IProduct>("Product", productSchema);
