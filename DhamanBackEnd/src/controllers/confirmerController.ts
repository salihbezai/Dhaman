import { Request, Response } from "express";
import { Order, OrderStatus } from "../models/Order";
import mongoose from "mongoose";

// 1. Get orders for Confirmer (New, No Answer, Postponed)
export const getConfirmerOrders = async (req: Request, res: Response) => {
  try {
    console.log("trying to get them");
    const orders = await Order.find()
      .populate("items.product", "name sku basePrice")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};
// 2. Add New Order
import { Product } from "../models/Product";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, ...orderData } = req.body;

    // 1. Map through items and fetch real details from DB
    const processedItems = await Promise.all(
      items.map(async (item: any) => {
        const productDoc = await Product.findById(item.product);

        if (!productDoc) throw new Error(`Product ${item.product} not found`);

        return {
          product: productDoc._id,
          productName: productDoc.name, // The server "snaps" the name here
          quantity: item.quantity,
          priceAtTimeOfOrder: productDoc.basePrice, // The server "snaps" the price
        };
      }),
    );

    // 2. Calculate total automatically
    const totalAmount = processedItems.reduce(
      (sum, item) => sum + item.priceAtTimeOfOrder * item.quantity,
      0,
    );

    // 3. Create the order
    const newOrder = new Order({
      ...orderData,
      items: processedItems,
      totalAmount,
      confirmerId: req.user?.id,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};


// update order
export const updateOrder = async (req: Request, res: Response) => {
  try {
        const { customerName, customerPhone, totalAmount, wilaya, address, items } = req.body;

    const id = req.params.id as string;
    // 1. Check if ID is a valid MongoDB ObjectId to avoid crash
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID format" });
    }


    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.customerName = customerName;
    order.customerPhone = customerPhone;
    order.totalAmount = totalAmount;
    order.wilaya = wilaya;
    order.address = address;
    order.items = items;

    await order.save();
    res.status(200).json({ order });
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
}

// 3. Action: No Answer (Handles the 3-call logic)
export const handleNoAnswer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // 1. Check if ID is a valid MongoDB ObjectId to avoid crash
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID format" });
    }
    const { newAttempts } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.callAttempts = newAttempts;
    // logic: If attempts reach 3 (per your requirements), auto-cancel
    if (order.callAttempts >= 3) {
      order.status = OrderStatus.CANCELLED;
      order.history.push({
        status: OrderStatus.CANCELLED,
        updatedAt: new Date(),
        updatedBy: new mongoose.Types.ObjectId(req.user?.id),
        note: "Auto-cancelled after 3 failed call attempts",
      });
    }

    await order.save();
    res.status(200).json({ order });
  } catch (err) {
    console.log("error in handle now answe " + err);
    res.status(400).json({ message: "Update failed" });
  }
};

// 4. Action: Confirm (Moves to Out for Delivery)
export const confirmOrder = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  // 1. Check if ID is a valid MongoDB ObjectId to avoid crash
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Order ID format" });
  }
  try {
    // 1. Check if ID is a valid MongoDB ObjectId to avoid crash
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID format" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        $set: { status: OrderStatus.CONFIRMED },
        $push: {
          history: {
            status: OrderStatus.CONFIRMED,
            updatedAt: new Date(),
            updatedBy: new mongoose.Types.ObjectId(req.user?.id),
            note: "Order confirmed by confirmer",
          },
        },
      },
      { returnDocument: "after", runValidators: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

export const handleCancelOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // 1. Check if ID is a valid MongoDB ObjectId to avoid crash
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID format" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: OrderStatus.CANCELLED,
        $push: {
          history: {
            status: OrderStatus.CANCELLED,
            updatedAt: new Date(),
            updatedBy: new mongoose.Types.ObjectId(req.user?.id),
            note: "Order cancelled by Confirmer",
          },
        },
      },
      { returnDocument: "after", runValidators: true },
    );
    res.status(200).json({ order });
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
};

export const handlePostponeOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { postponedDate } = req.body;
    console.log("trying to postpone")
    // 1. Check if ID is a valid MongoDB ObjectId to avoid crash
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID format" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: OrderStatus.POSTPONED,
        $push: {
          history: {
            status: OrderStatus.POSTPONED,
            updatedAt: new Date(),
            updatedBy: new mongoose.Types.ObjectId(req.user?.id),
            note: `Order postponed to ${postponedDate}`,
          },
        },
      },
      { new: true },
    );
    res.status(200).json({ order });
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
};
