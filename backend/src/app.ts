import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import productRoutes from "./routes/productRoutes";
import stockRoutes from "./routes/stockRoutes";
import challanRoutes from "./routes/challanRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    project: "Mini ERP + CRM Operations Portal",
    version: "1.0.0",
    status: "running",
    environment: process.env.NODE_ENV,
    database: {
      name: "MongoDB Atlas",
      status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      host: mongoose.connection.host || "not connected",
    },
    routes: {
      auth: {
        "POST /api/auth/login": "Public - Login with email and password",
        "POST /api/auth/register": "Admin only - Register new user",
        "GET /api/auth/me": "Protected - Get current logged in user",
      },
      customers: {
        "GET /api/customers": "Admin, Sales, Accounts - Get all customers (paginated, searchable)",
        "POST /api/customers": "Admin, Sales - Create new customer",
        "GET /api/customers/:id": "Admin, Sales, Accounts - Get customer by ID",
        "PUT /api/customers/:id": "Admin, Sales - Update customer",
        "POST /api/customers/:id/follow-up": "Admin, Sales - Add follow-up note",
      },
      products: {
        "GET /api/products": "All roles - Get all products (paginated, searchable)",
        "POST /api/products": "Admin, Warehouse - Create new product",
        "GET /api/products/low-stock": "Admin, Warehouse, Sales - Get low stock products",
        "GET /api/products/:id": "All roles - Get product by ID",
        "PUT /api/products/:id": "Admin, Warehouse - Update product",
      },
      stock: {
        "GET /api/stock": "Admin, Warehouse, Accounts - Get all stock movements (paginated)",
        "POST /api/stock": "Admin, Warehouse - Add stock movement (IN or OUT)",
      },
      challans: {
        "GET /api/challans": "Admin, Sales, Accounts - Get all challans (paginated)",
        "POST /api/challans": "Admin, Sales - Create new challan",
        "GET /api/challans/:id": "Admin, Sales, Accounts - Get challan by ID",
        "PATCH /api/challans/:id/status": "Admin, Sales - Update challan status",
      },
    },
    queryParams: {
      pagination: "?page=1&limit=20",
      customerSearch: "?search=name&status=Active&customerType=Wholesale",
      productSearch: "?search=sku&category=Electronics",
      stockFilter: "?productId=id&movementType=IN",
      challanFilter: "?status=Confirmed&customerId=id",
    },
    roles: ["admin", "sales", "warehouse", "accounts"],
    challanStatuses: ["Draft", "Confirmed", "Cancelled"],
    customerStatuses: ["Lead", "Active", "Inactive"],
    customerTypes: ["Retail", "Wholesale", "Distributor"],
    stockMovementTypes: ["IN", "OUT"],
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/challans", challanRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
