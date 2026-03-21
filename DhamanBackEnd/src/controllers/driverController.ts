import { Request, Response } from "express";
import { Order, OrderStatus } from "../models/Order";
import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../models/Notification";
import { Notification as AppNotification } from "../models/Notification";
// 1. Fetch orders assigned to the specific driver
export const getDriverOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // We want to show today's finished work + all currently active work
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      driverId: userId,
      $or: [
        // 1. All Active/Pending work (no matter the date)
        { status: { $in: ["CONFIRMED", "OUT_FOR_DELIVERY", "POSTPONED"] } },

        // 2. All completed/failed work from TODAY only
        {
          status: { $in: ["DELIVERED", "CANCELLED", "RETURNED", "EXCHANGED"] },
          updatedAt: { $gte: todayStart },
        },
      ],
    })
      .populate("items.product", "name sku basePrice")
      .sort({ updatedAt: -1 }); // Sort by most recent update so finished ones appear at the top of history

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Error fetching driver tasks" });
  }
};

// 2. Update status and log history
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    console.log("the status and note and id " + id + " " + status + " " + note);

    const order = await Order.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ message: { en: "Order not found", ar: "الطلب غير موجود" } });

    // Update status and history
    order.status = status as OrderStatus;
    order.history.push({
      status: status as OrderStatus,
      updatedAt: new Date(),
      updatedBy: new mongoose.Types.ObjectId(req.user!.id as string),
      note: note,
    });

    // Auto-fill payment if delivered
    if (status === OrderStatus.DELIVERED) {
      order.paymentReceived = order.totalAmount;
    }

    await order.save();
    res.status(200).json({ order });
  } catch (err) {
    res
      .status(400)
      .json({ message: { en: "Update failed", ar: "فشل في التحديث" } });
  }
};

// 3. Handle Arrival Alert
export const markArrival = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 2. Fetch the order first to ensure it exists and get the Confirmer ID
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: { en: "Order not found", ar: "الطلبية غير موجودة" },
      });
    }

    // 3. Update the order status
    order.deliveryNotificationSent = true;
    await order.save();

    // 4. Build the notification (using the renamed Model)
    // IMPORTANT: Make sure 'confirmerId' or 'createdBy' is the correct field name in your Order Schema
    const notificationData = {
      recipientId: order.confirmerId, // Fallback check
      senderId: req.user?.id,
      orderId: order._id,
      type: NOTIFICATION_TYPES.DRIVER_ARRIVED,
    };

    // Use the renamed import here
    const createdNotification = await AppNotification.create(notificationData);

    // 1. Grab the io instance from the app
    const io = req.app.get("socketio");

 

    const confirmerId = order.confirmerId!.toString();
    
    // 2. Target ONLY the room belonging to that specific Confirmer
    io.to(confirmerId).emit("NEW_NOTIFICATION_DRIVER", order);

    return res.status(200).json({
      order,
    });
  } catch (err) {
    console.error("Error in markArrival:", err);
    return res.status(500).json({
      message: { en: "Failed to send alert", ar: "فشل في إرسال التنبيه" },
    });
  }
};

// Accept order by driver
export const acceptOrderByDriver = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { driverId: req.user?.id },
      { new: true },
    );
    if (!order) {
      return res
        .status(404)
        .json({ message: { en: "Order not found", ar: "الطلبية غير موجودة" } });
    }

    // check if the order already has a driver
    console.log("the order " + JSON.stringify(order));
    console.log("order.driverId " + order.driverId);
    if (
      order.driverId === undefined ||
      order.driverId === null ||
      order.driverId === ""
    ) {
      return res
        .status(400)
        .json({
          message: {
            en: "Order already has a driver",
            ar: "تم تعيين سائق لهذه الطلبية",
          },
        });
    }
    res.status(200).json({ order });
  } catch (err) {
    res.status(400).json({
      message: { en: "Failed to accept order", ar: "فشل في قبول الطلب" },
    });
  }
};
