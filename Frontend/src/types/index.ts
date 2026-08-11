export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "sales" | "warehouse" | "accounts";
  isActive: boolean;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "sales" | "warehouse" | "accounts";
  token: string;
}

export interface FollowUpNote {
  _id: string;
  note: string;
  createdBy: { name: string; role: string };
  createdAt: string;
}

export interface Customer {
  _id: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType: "Retail" | "Wholesale" | "Distributor";
  address: string;
  status: "Lead" | "Active" | "Inactive";
  followUpDate?: string;
  notes?: string;
  followUpNotes: FollowUpNote[];
  createdBy: { name: string; role: string };
  createdAt: string;
}

export interface CustomerFormData {
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType: "Retail" | "Wholesale" | "Distributor";
  address: string;
  status: "Lead" | "Active" | "Inactive";
  followUpDate?: string;
  notes?: string;
}

export interface Product {
  _id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlert: number;
  location: string;
  isActive: boolean;
  createdBy: { name: string; role: string };
  createdAt: string;
}

export interface ProductFormData {
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlert: number;
  location: string;
}

export interface StockMovement {
  _id: string;
  product: { _id: string; productName: string; sku: string };
  quantityChanged: number;
  movementType: "IN" | "OUT";
  reason: string;
  createdBy: { name: string; role: string };
  createdAt: string;
}

export interface ChallanItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface Challan {
  _id: string;
  challanNumber: string;
  customer: { _id: string; customerName: string; businessName: string; mobileNumber: string; email: string };
  items: ChallanItem[];
  totalQuantity: number;
  status: "Draft" | "Confirmed" | "Cancelled";
  createdBy: { name: string; role: string };
  createdAt: string;
}

export interface ChallanFormItem {
  productId: string;
  quantity: number;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  [key: string]: T[] | number;
}

export interface ApiError {
  message: string;
}
