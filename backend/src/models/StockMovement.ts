import mongoose, { Document, Schema } from "mongoose";

export interface IStockMovement extends Document {
  product: mongoose.Types.ObjectId;
  quantityChanged: number;
  movementType: "IN" | "OUT";
  reason: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantityChanged: { type: Number, required: true, min: 1 },
    movementType: { type: String, enum: ["IN", "OUT"], required: true },
    reason: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStockMovement>("StockMovement", stockMovementSchema);
