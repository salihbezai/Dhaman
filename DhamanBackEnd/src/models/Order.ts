import mongoose, { Schema, model, Document, Types } from "mongoose";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  POSTPONED = "POSTPONED",
  CANCELLED = "CANCELLED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  RETURNED = "RETURNED",
  EXCHANGED = "EXCHANGED",
}

interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  wilaya: string;
  // Refined items to link to Product model
  items: Array<{
    product: Types.ObjectId; // Reference to Product
    productName: string; // Denormalized for quick display
    quantity: number;
    priceAtTimeOfOrder: number;
  }>;
  totalAmount: number;
  deliveryPrice: number;
  status: OrderStatus;

  confirmerId?: Types.ObjectId;
  driverId?: Types.ObjectId;

  callAttempts: number;
  postponedDate?: Date;
  deliveryNotificationSent: boolean;
  paymentReceived: number;

  history: Array<{
    status: OrderStatus;
    updatedAt: Date;
    updatedBy: Types.ObjectId;
    note?: string;
  }>;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,

      default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    address: { type: String, required: true },
    wilaya: { type: String, required: true },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: String, // Storing name directly helps if product is deleted later
        quantity: { type: Number, default: 1 },
        priceAtTimeOfOrder: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    deliveryPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    confirmerId: { type: Schema.Types.ObjectId, ref: "User" },
    driverId: { type: Schema.Types.ObjectId, ref: "User" },
    callAttempts: { type: Number, default: 0 },
    postponedDate: { type: Date },
    deliveryNotificationSent: { type: Boolean, default: false },
    paymentReceived: { type: Number, default: 0 },
    history: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: mongoose.Types.ObjectId,
        note: String,
      },
    ],
  },
  { timestamps: true },
);

export const Order = model<IOrder>("Order", orderSchema);
