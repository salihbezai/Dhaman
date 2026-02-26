import { Request, Response } from 'express';
import { User, UserRole } from '../models/User';
import { Order, OrderStatus } from '../models/Order';
import bcrypt from "bcrypt";

export const getTeam = async (req: Request, res: Response) => {
    console.log("trying to get teams")
  const team = await User.find({ role: { $ne: UserRole.SUPERVISOR } }).select('-password -refreshTokens');
    console.log("the result "+JSON.stringify(team))
  res.json(team);
};

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password, phone, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    username, email, password: hashedPassword, phone, role, isActive: true
  });
  res.status(201).json(newUser);
};

export const deleteUser = async (req: Request, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: {en:"User deleted", ar:"تم حذف المستخدم"} });
};

export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
};



