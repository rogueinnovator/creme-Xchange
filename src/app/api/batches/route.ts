/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import Batch from "@/models/batch.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
// import mongoose from 'mongoose';

//FETCH ALL BATCHES
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["upstream", "admin"].includes(user.userProfile)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    type RequestBody = {
      shipmentId: string;
      shipmentDate: string;
      arrivalDate: string;
      category: string;
      origin: string;
      destination: string;
      weight: number;
    };
    const {
      shipmentId,
      shipmentDate,
      arrivalDate,
      category,
      origin,
      destination,
      weight,
    }: RequestBody = await request.json();
    if (
      !shipmentId ||
      !shipmentDate ||
      !arrivalDate ||
      !category ||
      !origin ||
      !destination ||
      !weight
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    await connectDB();
    const existingBatchWithId = await Batch.findOne({ shipmentId });
    if (existingBatchWithId) {
      return NextResponse.json(
        {
          success: false,
          message: "Batch with this shipment ID already exists",
        },
        { status: 409 }
      );
    }
    const newBatch = await Batch.create({
      createdBy: new mongoose.Types.ObjectId((user.id as any).buffer),
      shipmentId,
      shipmentDate: new Date(shipmentDate),
      arrivalDate: new Date(arrivalDate),
      category,
      origin,
      destination,
      weight: Number(weight),
      timeline: {
        collection: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Batch created successfully",
        batch: newBatch,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating new Batch:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create new batch",
        error: error.errors || null,
      },
      { status: 500 }
    );
  }
}
