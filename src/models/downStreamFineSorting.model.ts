import mongoose, { Document, Schema, Model } from "mongoose";

// interface IDownStreamFineSortingTimeline {
//   collection?: Date;
//   sorting?: Date;
//   shipping?: Date;
//   arrival?: Date;
//   final_use?: Date;
// }

// type DownStreamFineSortingStatus =
//   | "collection"
//   | "sorting"
//   | "shipping"
//   | "arrival"
//   | "final_use";

interface IDownStreamFineSorting extends Document {
  batchId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  batchNumber: string;
  dateReceived: Date;
  totalItemsReceived: number;
  totalSaleableItems: number;
  totalUnsaleableItems: number;
  totalStockReceived: number;
  totalReturnItems: number;
  // status: DownStreamFineSortingStatus;
  // timeline: IDownStreamFineSortingTimeline;
}

const DownStreamFineSortingSchema: Schema<IDownStreamFineSorting> =
  new mongoose.Schema(
    {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },
      batchNumber: {
        type: String,
        required: true,
      },
      dateReceived: {
        type: Date,
        required: true,
      },
      totalItemsReceived: {
        type: Number,
        required: true,
        min: 0,
      },
      totalSaleableItems: {
        type: Number,
        required: true,
        min: 0,
      },
      totalUnsaleableItems: {
        type: Number,
        required: true,
        min: 0,
      },
      totalStockReceived: {
        type: Number,
        required: true,
        min: 0,
      },
      totalReturnItems: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      timestamps: true,
    }
  );
const DownStreamFineSorting: Model<IDownStreamFineSorting> =
  mongoose.models?.DownStreamFineSorting ||
  mongoose.model<IDownStreamFineSorting>(
    "DownStreamFineSorting",
    DownStreamFineSortingSchema
  );

export default DownStreamFineSorting;
