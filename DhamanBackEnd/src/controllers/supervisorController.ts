import { Request, Response } from 'express';
import { User, UserRole } from '../models/User';
import { Order, OrderStatus } from '../models/Order';
import bcrypt from "bcrypt";
import { Product } from '../models/Product';
import { logger } from '../utility';

export const getTeam = async (req: Request, res: Response) => {
  const team = await User.find({ role: { $ne: UserRole.SUPERVISOR } })
  .select('-password -refreshTokens')
  .sort({ isActive: -1, username: 1 });
  res.json({team});
};

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password, phone, role } = req.body;
  try {
      const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    username, email, password: hashedPassword, phone, role, isActive: true
  });
  res.status(201).json(newUser);
  } catch (error) {
    const err = error as Error;
    logger.error({
      message: "Error during creating user",
      error: err.message,
      stack: err.stack,
      route: req.originalUrl,
    });
    res
      .status(500)
      .json({
        message: {
          en: "Server error during user creation.",
          ar: "خطأ في الخادم أثناء انشاء المستخدم.",
        },
      });
  }

};

export const deleteUser = async (req: Request, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: {en:"User deleted", ar:"تم حذف المستخدم"} });
};



export const getAllOrders = async (req: Request, res: Response) => {
  try {
    console.log("trying to get them");
    const orders = await Order.find()
      .populate("items.product", "name sku basePrice")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};




// product

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, basePrice, stockQuantity } = req.body;
    const product = await Product.create({ name, sku, basePrice, stockQuantity });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "Product creation failed" });
  }
};

