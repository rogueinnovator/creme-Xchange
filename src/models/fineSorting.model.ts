import mongoose, { Document, Schema, Model } from "mongoose";

export interface IFineSorting extends Document {
  batchId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  shipmentId: string;
  noOfBags: number;
  itemTypes: string[];
  locationOfShop: string;
  grade: string;
}

const FineSortingSchema: Schema<IFineSorting> = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipmentId: {
      type: String,
      required: true,
      unique: true,
    },
    noOfBags: {
      type: Number,
      required: true,
      min: 0,
    },
    itemTypes: {
      type: [String],
      required: true,
    },
    locationOfShop: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const FineSorting: Model<IFineSorting> =
  mongoose.models?.FineSorting ||
  mongoose.model<IFineSorting>("FineSorting", FineSortingSchema);
export default FineSorting;
