import { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/Order';
import mongoose from 'mongoose';

// 1. Get orders for Confirmer (New, No Answer, Postponed)
export const getConfirmerOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({
      status: { $in: ['PENDING', 'NO_ANSWER', 'POSTPONED'] }
    }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// 2. Add New Order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const newOrder = new Order({
      ...req.body,
      status: OrderStatus.PENDING,
      confirmerId: req.user?.id,
      history: [{
        status: OrderStatus.PENDING,
        updatedAt: new Date(),
        updatedBy: new mongoose.Types.ObjectId(req.user?.id as string),
        note: ""
      }]
    });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: "Validation error", error: err });
  }
};



// 3. Action: No Answer (Handles the 3-call logic)
export const handleNoAnswer = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.callAttempts += 1;
    
    // logic: If attempts reach 3 (per your requirements), auto-cancel
    if (order.callAttempts >= 3) {
      order.status = OrderStatus.CANCELLED;
      order.history.push({
        status: OrderStatus.CANCELLED,
        updatedAt: new Date(),
        updatedBy: new mongoose.Types.ObjectId(req.user?.id as string),
        note: "Auto-cancelled after 3 failed call attempts"
      });
    }

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
};

// 4. Action: Confirm (Moves to Out for Delivery)
export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.body; // Assigned driver
    const order = await Order.findByIdAndUpdate(req.params.id, {
      status: OrderStatus.CONFIRMED,
      driverId: new mongoose.Types.ObjectId(driverId),
      $push: {
        history: {
          status: OrderStatus.CONFIRMED,
          updatedAt: new Date(),
          updatedBy: new mongoose.Types.ObjectId(req.user?.id as string),
          note: "Order confirmed and driver assigned"
        }
      }
    }, { new: true });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: "Confirmation failed" });
  }
};