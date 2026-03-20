import { Schema, model, Document, Types } from 'mongoose';

export enum NOTIFICATION_TYPES {
DRIVER_ARRIVED = "DRIVER_ARRIVED",
ORDER_ASSIGNED = "ORDER_ASSIGNED",
STATUS_CHANGED = "STATUS_CHANGED"
}
interface INotification extends Document {
  recipientId: Types.ObjectId; // The Confirmer
  senderId: Types.ObjectId;    // The Driver
  orderId: Types.ObjectId;
  type: NOTIFICATION_TYPES;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      default: NOTIFICATION_TYPES.ORDER_ASSIGNED,
      required: true
    },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = model<INotification>('Notification', notificationSchema);