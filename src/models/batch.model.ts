import mongoose, { Schema, Document, Model } from "mongoose";
interface IBatchTimeline {
  collection?: Date;
  sorting?: Date;
  shipping?: Date;
  arrival?: Date;
  final_use?: Date;
}
type BatchStatus =
  | "collection"
  | "sorting"
  | "shipping"
  | "arrival"
  | "final_use";
export interface IBatch extends Document {
  createdBy: mongoose.Schema.Types.ObjectId;
  shipmentId: string;
  shipmentDate: Date;
  arrivalDate: string;
  category: string;
  origin: string;
  destination: string;
  weight: number;
  status: BatchStatus;
  timeline: IBatchTimeline;
}

const BatchSchema: Schema<IBatch> = new mongoose.Schema<IBatch>(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    shipmentDate: {
      type: Date,
      required: true,
    },
    arrivalDate: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["collection", "sorting", "shipping", "arrival", "final_use"],
      default: "collection",
    },
    timeline: {
      collection: { type: Date },
      sorting: { type: Date },
      shipping: { type: Date },
      arrival: { type: Date },
      final_use: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

const Batch: Model<IBatch> =
  mongoose.models?.Batch || mongoose.model<IBatch>("Batch", BatchSchema);
export default Batch;
