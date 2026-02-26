import { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/Order';
import mongoose from 'mongoose';

// 1. Fetch orders assigned to the specific driver
export const getDriverOrders = async (req: Request, res: Response) => {
  try {
    // req.user.id comes from the 'protect' middleware
    const orders = await Order.find({ 
      driverId: req.user?.id, 
      status: OrderStatus.OUT_FOR_DELIVERY 
    }).sort({ updatedAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 
        {en:"Failed to fetch orders", ar:"فشل في جلب الطلبات"}
    });
  }
};

// 2. Update status and log history
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: {en:"Order not found", ar:"الطلب غير موجود"} });

    // Update status and history
    order.status = status as OrderStatus;
    order.history.push({
      status: status as OrderStatus,
      updatedAt: new Date(),
      updatedBy: new mongoose.Types.ObjectId(req.user!.id as string),
      note: note
    });

    // Auto-fill payment if delivered
    if (status === OrderStatus.DELIVERED) {
      order.paymentReceived = order.totalAmount;
    }

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: {en:"Update failed", ar:"فشل في التحديث"} });
  }
};

// 3. Handle Arrival Alert
export const markArrival = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { deliveryNotificationSent: true },
      { new: true }
    );
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: {en:"Failed to send alert", ar:"فشل في إرسال التنبيه"} });
  }
};