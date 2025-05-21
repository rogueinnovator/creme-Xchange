import mongoose, { Document, Schema, Model } from "mongoose";
interface IWholeSaler extends Document {
  batchId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  retailerName: string;
  noOfBags: number;
  totalWeightSold: number;
}

const WholesalerSchema: Schema<IWholeSaler> = new mongoose.Schema(
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
    retailerName: {
      type: String,
      required: true,
      trim: true,
    },
    noOfBags: {
      type: Number,
      required: true,
      min: 0,
    },
    totalWeightSold: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const WholeSaler: Model<IWholeSaler> =
  mongoose.models?.WholeSaler ||
  mongoose.model<IWholeSaler>("WholeSaler", WholesalerSchema);

export default WholeSaler;
