import mongoose, { Document, Schema } from "mongoose";

export interface IChallanItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface IChallan extends Document {
  challanNumber: string;
  customer: mongoose.Types.ObjectId;
  items: IChallanItem[];
  totalQuantity: number;
  status: "Draft" | "Confirmed" | "Cancelled";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const challanItemSchema = new Schema<IChallanItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const challanSchema = new Schema<IChallan>(
  {
    challanNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: { type: [challanItemSchema], required: true },
    totalQuantity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["Draft", "Confirmed", "Cancelled"], default: "Draft" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IChallan>("Challan", challanSchema);
