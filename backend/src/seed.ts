import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User";
import Customer from "./models/Customer";
import Product from "./models/Product";
import connectDB from "./config/db";

dotenv.config();

const seedData = async (): Promise<void> => {
  await connectDB();

  await User.deleteMany({});
  await Customer.deleteMany({});
  await Product.deleteMany({});

  const admin = await User.create({
    name: "System Admin",
    email: "admin@erp.com",
    password: "password123",
    role: "admin",
  });

  const sales = await User.create({
    name: "Sales User",
    email: "sales@erp.com",
    password: "password123",
    role: "sales",
  });

  const warehouse = await User.create({
    name: "Warehouse User",
    email: "warehouse@erp.com",
    password: "password123",
    role: "warehouse",
  });

  await User.create({
    name: "Accounts User",
    email: "accounts@erp.com",
    password: "password123",
    role: "accounts",
  });

  await Customer.create({
    customerName: "Rajesh Patel",
    mobileNumber: "9876543210",
    email: "rajesh@patelelectronics.com",
    businessName: "Patel Electronics",
    gstNumber: "27AAAAA0000A1Z5",
    customerType: "Wholesale",
    address: "Shop 12, Electronic Market, Mumbai, Maharashtra",
    status: "Active",
    followUpDate: new Date("2026-08-20"),
    notes: "Interested in bulk purchasing USB Type-C cables and mechanical keyboards.",
    createdBy: sales._id,
  });

  await Customer.create({
    customerName: "Anita Sharma",
    mobileNumber: "9812345678",
    email: "anita@techworld.com",
    businessName: "Tech World Enterprises",
    gstNumber: "27BBBBB1111B2Z6",
    customerType: "Distributor",
    address: "Plot 45, Industrial Zone, Pune, Maharashtra",
    status: "Lead",
    followUpDate: new Date("2026-08-15"),
    notes: "Requested quotation for wireless mice and ergonomic office keyboards.",
    createdBy: sales._id,
  });

  await Product.create({
    productName: "USB Type-C Fast Charging Cable 1m",
    sku: "CAB-USBC-001",
    category: "Accessories",
    unitPrice: 250,
    currentStock: 150,
    minimumStockAlert: 20,
    location: "Warehouse A - Rack 3B",
    createdBy: warehouse._id,
  });

  await Product.create({
    productName: "Wireless Ergonomic Optical Mouse",
    sku: "MOU-WIR-002",
    category: "Peripherals",
    unitPrice: 750,
    currentStock: 80,
    minimumStockAlert: 15,
    location: "Warehouse A - Rack 4A",
    createdBy: warehouse._id,
  });

  await Product.create({
    productName: "Mechanical Gaming Keyboard RGB",
    sku: "KEY-MEC-003",
    category: "Peripherals",
    unitPrice: 3200,
    currentStock: 8,
    minimumStockAlert: 10,
    location: "Warehouse B - Shelf 12",
    createdBy: warehouse._id,
  });

  console.log("Database seeded successfully");
  mongoose.connection.close();
};

seedData().catch((err) => {
  console.error("Error seeding database:", err);
  mongoose.connection.close();
});
