import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import WholeSaler from "@/models/wholeSaler.model";
import Batch from "@/models/batch.model";

interface WholesalerPayload {
  batchId: string;
  retailerName: string;
  numberOfBags: number;
  totalWeightSold: number;
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
        { status: 401 }
      );
    }

    const query: Record<string, string> = {};
    if (batchId) {
      query.batch = batchId;
    }

    const wholesalerData = await WholeSaler.find(query).populate("batchId");

    return NextResponse.json({
      success: true,
      message: "Wholesaler data fetched successfully",
      data: wholesalerData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch wholesaler data";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !["wholesaler", "admin"].includes(user.userProfile)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const payload: WholesalerPayload = await request.json();
    const { batchId, retailerName, numberOfBags, totalWeightSold } = payload;

    if (
      !batchId ||
      !retailerName ||
      numberOfBags === undefined ||
      totalWeightSold === undefined
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

    if (batch.status === "shipping") {
      batch.status = "arrival";
      batch.timeline.arrival = new Date();
      await batch.save();
    }

    const newWholesalerSelling = await WholeSaler.create({
      batchId,
      createdBy: user._id,
      retailerName,
      numberOfBags,
      totalWeightSold,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Wholesaler selling entry created successfully",
        data: newWholesalerSelling,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create wholesaler selling entry";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}