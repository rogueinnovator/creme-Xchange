import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import DownStreamFineSorting from "@/models/downStreamFineSorting.model";
import Batch from "@/models/batch.model";

interface DownstreamSortingPayload {
  batchNumber: string;
  dateReceived: string;
  totalItemsReceived: number;
  totalSaleableItems: number;
  totalUnsaleableItems: number;
  totalStockReceived: number;
  totalReturnItems: number;
}
// "/api/dashboard/upstream/fine-sorting":
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const batchNumber = searchParams.get("batchNumber");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const query: Record<string, string> = {};
    if (batchNumber) {
      query.batchNumber = batchNumber;
    }

    const downStreamSorting = await DownStreamFineSorting.find(query).populate(
      "batchId"
    );

    return NextResponse.json({
      success: true,
      message: "Downstream fine sorting data fetched successfully",
      data: downStreamSorting,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch downstream fine sorting data";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !["downstream", "admin"].includes(user.userProfile)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload: DownstreamSortingPayload = await request.json();
    const {
      batchNumber,
      dateReceived,
      totalItemsReceived,
      totalSaleableItems,
      totalUnsaleableItems,
      totalStockReceived,
      totalReturnItems,
    } = payload;

    if (
      !batchNumber ||
      !dateReceived ||
      totalItemsReceived === undefined ||
      totalSaleableItems === undefined ||
      totalUnsaleableItems === undefined ||
      totalStockReceived === undefined ||
      totalReturnItems === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();
    const batch = await Batch.findOne({ shipmentId: batchNumber });
    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found with this batch number" },
        { status: 404 }
      );
    }

    if (batch.status === "sorting") {
      batch.status = "shipping";
      batch.timeline.shipping = new Date();
      await batch.save();
    }

    const newDownstreamSorting = await DownStreamFineSorting.create({
      batchNumber,
      batchId: batch._id,
      createdBy: user._id,
      dateReceived,
      totalItemsReceived,
      totalSaleableItems,
      totalUnsaleableItems,
      totalStockReceived,
      totalReturnItems,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Downstream sorting created successfully",
        downstreamSorting: newDownstreamSorting,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create downstream sorting";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
