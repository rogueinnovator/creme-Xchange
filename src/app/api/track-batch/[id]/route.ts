/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";

import mongoose from "mongoose";
import getCurrentUser from "@/lib/features";
import Batch from "@/models/batch.model";
import FineSorting from "@/models/fineSorting.model";
import DownStreamFineSorting from "@/models/downStreamFineSorting.model";
import WholeSaler from "@/models/wholeSaler.model";
import Retailer from "@/models/retailer.model";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find batch by ID or shipmentId
    let batch;
    if (mongoose.Types.ObjectId.isValid(id)) {
      batch = await Batch.findById(id).populate("createdBy", "name");
    } else {
      batch = await Batch.findOne({ shipmentId: id }).populate(
        "createdBy",
        "name"
      );
    }

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found" },
        { status: 404 }
      );
    }

    // Get all related records
    const [fineSorting, downstreamSorting, wholesalerSelling, retailSelling] =
      await Promise.all([
        FineSorting.findOne({ batch: batch._id }),
        DownStreamFineSorting.findOne({ batch: batch._id }),
        WholeSaler.findOne({ batch: batch._id }),
        Retailer.findOne({ batch: batch._id }),
      ]);

    // Build timeline
    const timeline = [
      {
        stage: "collection",
        completed: true,
        date: batch.timeline.collection || null,
      },
      {
        stage: "sorting",
        completed: ["sorting", "shipping", "arrival", "final_use"].includes(
          batch.status
        ),
        date: batch.timeline.sorting || null,
      },
      {
        stage: "shipping",
        completed: ["shipping", "arrival", "final_use"].includes(batch.status),
        date: batch.timeline.shipping || null,
      },
      {
        stage: "arrival",
        completed: ["arrival", "final_use"].includes(batch.status),
        date: batch.timeline.arrival || null,
      },
      {
        stage: "final_use",
        completed: ["final_use"].includes(batch.status),
        date: batch.timeline.final_use || null,
      },
    ];

    return NextResponse.json({
      success: true,
      batch,
      timeline,
      metrics: {
        currentStage: batch.status,
        daysInTransit: Math.ceil(
          (new Date().getTime() - new Date(batch.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
      details: {
        fineSorting,
        downstreamSorting,
        wholesalerSelling,
        retailSelling,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message },
      { status: 500 }
    );
  }
}
