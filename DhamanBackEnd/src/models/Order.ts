import { Schema, model, Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  EXCHANGED = 'EXCHANGED',
}

interface IOrder extends Document {
  customerName: string;
  customerPhone: string;
  address: string;
  wilaya: string;
  items: Array<{ product: string; quantity: number; price: number }>;
  totalAmount: number;
  status: OrderStatus;
  
  // Actor References
  confirmerId?: Types.ObjectId;
  driverId?: Types.ObjectId;

  // Tracking details
  callAttempts: number; // For the "3 calls auto-cancel" logic
  postponedDate?: Date;
  deliveryNotificationSent: boolean; // When driver arrives
  paymentReceived: number;
  
  history: Array<{
    status: OrderStatus;
    updatedAt: Date;
    updatedBy: Types.ObjectId;
    note?: string;
  }>;
}

const orderSchema = new Schema<IOrder>({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  address: { type: String, required: true },
  wilaya: { type: String, required: true },
  items: [{
    product: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.PENDING 
  },
  confirmerId: { type: Schema.Types.ObjectId, ref: 'User' },
  driverId: { type: Schema.Types.ObjectId, ref: 'User' },
  callAttempts: { type: Number, default: 0 },
  postponedDate: { type: Date },
  deliveryNotificationSent: { type: Boolean, default: false },
  paymentReceived: { type: Number, default: 0 },
  history: [{
    status: String,
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    note: String
  }]
}, { timestamps: true });

export const Order = model<IOrder>('Order', orderSchema);