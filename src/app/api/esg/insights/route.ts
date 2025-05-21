/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import Batch from "@/models/batch.model";
import DownStreamFineSorting from "@/models/downStreamFineSorting.model";

export async function GET() {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Calculate ESG metrics
    const totalBatches = await Batch.countDocuments();
    const completedBatches = await Batch.countDocuments({
      status: "final_use",
    });

    // Calculate carbon footprint (simplified example)
    const batches = await Batch.find();
    let totalDistance = 0;
    let totalWeight = 0;
    let totalCarbonEmissions = 0;

    for (const batch of batches) {
      // This is a simplified calculation - in a real app you'd have more sophisticated logic
      const distance = 500; // Example distance in km (would be calculated based on origin/destination)
      totalDistance += distance;
      totalWeight += batch.weight;

      // Simple carbon calculation (example: 0.1 kg CO2 per ton-km)
      const carbonEmission = (batch.weight / 1000) * distance * 0.1;
      totalCarbonEmissions += carbonEmission;
    }

    // Calculate recycling metrics
    const totalSaleableItems = await DownStreamFineSorting.aggregate([
      { $group: { _id: null, total: { $sum: "$totalSaleableItems" } } },
    ]);

    const totalUnsaleableItems = await DownStreamFineSorting.aggregate([
      { $group: { _id: null, total: { $sum: "$totalUnsaleableItems" } } },
    ]);

    const totalReturnItems = await DownStreamFineSorting.aggregate([
      { $group: { _id: null, total: { $sum: "$totalReturnItems" } } },
    ]);

    // Calculate completion rate
    const completionRate =
      totalBatches > 0 ? (completedBatches / totalBatches) * 100 : 0;

    // Calculate recycling rate
    const totalItems =
      (totalSaleableItems[0]?.total || 0) +
      (totalUnsaleableItems[0]?.total || 0);
    const recyclingRate =
      totalItems > 0
        ? ((totalSaleableItems[0]?.total || 0) / totalItems) * 100
        : 0;

    // Monthly trends (simplified)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const monthlyBatches = await Batch.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          totalWeight: { $sum: "$weight" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format monthly data
    const monthlyData = monthlyBatches.map((item) => ({
      period: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      batchCount: item.count,
      totalWeight: item.totalWeight,
    }));

    return NextResponse.json({
      summary: {
        totalBatches,
        completedBatches,
        completionRate: Number.parseFloat(completionRate.toFixed(2)),
        recyclingRate: Number.parseFloat(recyclingRate.toFixed(2)),
      },
      carbonFootprint: {
        totalDistance,
        totalWeight,
        totalCarbonEmissions: Number.parseFloat(
          totalCarbonEmissions.toFixed(2)
        ),
        carbonPerTon:
          totalWeight > 0
            ? Number.parseFloat(
                (totalCarbonEmissions / (totalWeight / 1000)).toFixed(2)
              )
            : 0,
      },
      recycling: {
        totalSaleableItems: totalSaleableItems[0]?.total || 0,
        totalUnsaleableItems: totalUnsaleableItems[0]?.total || 0,
        totalReturnItems: totalReturnItems[0]?.total || 0,
      },
      monthlyTrends: monthlyData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message },
      { status: 500 }
    );
  }
}
