import mongoose, { Schema, Document, Model } from "mongoose";

export type UserProfile =
  | "upstream"
  | "downstream"
  | "wholesaler"
  | "retailer"
  | "admin";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userProfile: UserProfile;
  approved: boolean;
  country?: string;
  otp?: string;
  otpExpires?: Date;
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      trim: true,
    },
    userProfile: {
      type: String,
      enum: ["upstream", "downstream", "wholesaler", "retailer", "admin"],
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      trim: true,
    },
    otpExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);
export default User;
