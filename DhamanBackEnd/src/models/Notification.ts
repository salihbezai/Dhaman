import { Schema, model, Document, Types } from 'mongoose';

interface INotification extends Document {
  recipientId: Types.ObjectId; // The Confirmer
  senderId: Types.ObjectId;    // The Driver
  orderId: Types.ObjectId;
  type: 'DRIVER_ARRIVED' | 'ORDER_ASSIGNED' | 'STATUS_CHANGE';
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  type: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = model<INotification>('Notification', notificationSchema);