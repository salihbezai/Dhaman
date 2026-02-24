import { Schema, model, Document } from "mongoose";

export enum UserRole {
  SUPERVISOR = "SUPERVISOR",
  CONFIRMER = "CONFIRMER",
  DRIVER = "DRIVER",
}

interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  refreshTokens: { token: string; createdAt: Date; expiresAt: Date }[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
  isActive: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
      },
    ],
    currentLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: { type: Date, default: Date.now },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", userSchema);
