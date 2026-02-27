import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  sku: string; // Unique identifier for the product
  basePrice: number; // Standard price
  stockQuantity: number;
  category?: string; // Optional category field
  isActive: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    basePrice: { type: Number, required: true },
    stockQuantity: { type: Number, default: 0 },
    category: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Product = model<IProduct>("Product", productSchema);
