import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: "User already exists with this email" });
    return;
  }

  const user = await User.create({ name, email, password, role });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id.toString()),
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !user.isActive) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id.toString()),
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user;
  res.status(200).json(user);
};
