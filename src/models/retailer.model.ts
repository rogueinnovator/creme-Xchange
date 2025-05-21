import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRetailer extends Document {
  batchId: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
  totalSoldBales: number;
  totalReturnedBales: number;
}
const RetailSchema: Schema<IRetailer> = new mongoose.Schema(
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
    totalSoldBales: { type: Number, required: true, min: 0 },
    totalReturnedBales: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Retailer: Model<IRetailer> =
  mongoose.models.Retailer ||
  mongoose.model<IRetailer>("Retailer", RetailSchema);
export default Retailer;
