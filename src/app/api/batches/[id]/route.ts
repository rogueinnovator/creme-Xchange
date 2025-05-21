/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import Batch from "@/models/batch.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const batch = await Batch.findById(id).populate("createdBy");

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "batch retrieved successfully",
      batch,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user || !["upstream", "admin"].includes(user.userProfile)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const updateData = await request.json();

    const batch = await Batch.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(typeof updateData === "object" && updateData !== null
            ? updateData
            : {}),
        },
      },
      {
        new: true,
      }
    );

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch Not Found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Batch updated successfully",
      batch,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user || !["upstream", "admin"].includes(user.userProfile)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectDB();

    const batch = await Batch.findByIdAndDelete(id);

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Batch deleted successfully",
      batch,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
