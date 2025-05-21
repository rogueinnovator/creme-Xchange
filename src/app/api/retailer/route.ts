import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import Retailer from "@/models/retailer.model";
import Batch from "@/models/batch.model";
interface RetailerPayload {
  batchId: string;
  totalSoldInBales: number;
  totalReturnedItemsInBales: number;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const query: Record<string, string> = {};
    if (batchId) {
      query.batch = batchId;
    }

    const retailSelling = await Retailer.find(query).populate("batch");

    return NextResponse.json({
      success: true,
      message: "Retailer data fetched successfully",
      data: retailSelling,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch retailer data";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !["retailer", "admin"].includes(user.userProfile)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const payload: RetailerPayload = await request.json();
    const { batchId, totalSoldInBales, totalReturnedItemsInBales } = payload;

    if (
      !batchId ||
      totalSoldInBales === undefined ||
      totalReturnedItemsInBales === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found" },
        { status: 404 }
      );
    }

    if (batch.status === "arrival") {
      batch.status = "final_use";
      batch.timeline.final_use = new Date();
      await batch.save();
    }

    const newRetailSelling = await Retailer.create({
      createdBy: user._id,
      batchId,
      totalSoldInBales,
      totalReturnedItemsInBales,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Retail selling entry created successfully",
        data: newRetailSelling,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create retail selling entry";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
