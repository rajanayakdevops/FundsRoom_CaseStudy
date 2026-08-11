import mongoose, { Document, Schema } from "mongoose";

export interface IFollowUpNote {
  note: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ICustomer extends Document {
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType: "Retail" | "Wholesale" | "Distributor";
  address: string;
  status: "Lead" | "Active" | "Inactive";
  followUpDate?: Date;
  notes?: string;
  followUpNotes: IFollowUpNote[];
  createdBy: mongoose.Types.ObjectId;
}

const followUpNoteSchema = new Schema<IFollowUpNote>(
  {
    note: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const customerSchema = new Schema<ICustomer>(
  {
    customerName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    gstNumber: { type: String, trim: true },
    customerType: { type: String, enum: ["Retail", "Wholesale", "Distributor"], required: true },
    address: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Lead", "Active", "Inactive"], default: "Lead" },
    followUpDate: { type: Date },
    notes: { type: String, trim: true },
    followUpNotes: { type: [followUpNoteSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

customerSchema.index({ customerName: "text", businessName: "text", email: "text" });

export default mongoose.model<ICustomer>("Customer", customerSchema);
