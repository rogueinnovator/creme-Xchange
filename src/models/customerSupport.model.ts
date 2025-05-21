import mongoose from "mongoose";

export type CustomerSupportCategory =
  | "ESG Error"
  | "Technical Issue"
  | "Account"
  | "Batch"
  | "Other";

export type CustomerSupportStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export interface ICustomerSupport {
  userId: mongoose.Types.ObjectId;
  category: CustomerSupportCategory;
  description: string;
  status?: CustomerSupportStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerSupportSchema = new mongoose.Schema<ICustomerSupport>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Support category is required"],
      enum: ["ESG Error", "Technical Issue", "Account", "Batch", "Other"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

const CustomerSupport =
  mongoose.model("CustomerSupport", CustomerSupportSchema);

export default CustomerSupport;