import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import Batch from "@/models/batch.model";
import FineSorting from "@/models/fineSorting.model";

interface FineSortingPayload {
  batchId: string;
  shipmentId: string;
  numberOfBags: number;
  itemTypes: string[];
  locationOfShop: string;
  grade: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get("shipmentId");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const query: Record<string, string> = {};
    if (shipmentId) {
      query.shipmentId = shipmentId;
    }

    const fineSortingData = await FineSorting.find(query).populate("batchId");

    return NextResponse.json({
      success: true,
      message: "Fine Sorting fetched successfully",
      data: fineSortingData,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch fine sorting data";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !["downstream", "admin"].includes(user.userProfile)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const payload: FineSortingPayload = await request.json();
    const {
      batchId,
      shipmentId,
      numberOfBags,
      itemTypes,
      locationOfShop,
      grade,
    } = payload;

    if (
      !batchId ||
      !shipmentId ||
      !numberOfBags ||
      !itemTypes?.length ||
      !locationOfShop ||
      !grade
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();
    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found with this ID" },
        { status: 404 }
      );
    }

    if (batch.status === "collection") {
      batch.status = "sorting";
      batch.timeline.sorting = new Date();
      await batch.save();
    }

    const newFineSorting = await FineSorting.create({
      batchId: batch._id,
      shipmentId,
      numberOfBags,
      itemTypes,
      locationOfShop,
      grade,
      createdBy: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Fine sorting created successfully",
        data: newFineSorting,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create fine sorting";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
