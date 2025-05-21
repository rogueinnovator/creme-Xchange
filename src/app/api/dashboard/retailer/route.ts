import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import Retailer from "@/models/retailer.model";
import { NextRequest, NextResponse } from "next/server";

// export async function GET() {
//   try {
//     await connectDB();

//     const user = await getCurrentUser();

//     if (!user || user.userProfile !== "admin") {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 403 }
//       );
//     }
//     const retailers = await Retailer.aggregate([
//       {
//         $lookup: {
//           from: "batches",
//           foreignField: "_id",
//           localField: "batchId",
//           as: "batch",
//         },
//       },
//       {
//         $project: {
//           shipmentId: "$batch.shipmentId",
//           totalSoldBales: 1,
//           totalReturnedBales: 1,
//         },
//       },

//       {
//         $sort: { createdAt: -1 },
//       },
//     ]);

//     return NextResponse.json({
//       success: true,
//       message: "Retailer fecthed successfully",
//       retailers,
//     });
//   } catch {
//     return NextResponse.json(
//       { success: false, message: "Error Getting Retailer" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user || user.userProfile !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Map frontend field names to aggregation field paths if needed
    const fieldMapping: Record<string, string> = {
      totalSoldBales: "totalSoldBales",
      totalReturnedBales: "totalReturnedBales",
      shipmentId: "shipmentId",
      // Add more mappings as needed
    };

    // Use the mapped field name or default to the original
    const dbSortField = fieldMapping[sortField] || sortField;

    // Create sort object for the aggregation
    const sortStage: Record<string, 1 | -1> = {};

    // Handle special case for shipmentId which is in the batch array
    if (dbSortField === "shipmentId") {
      sortStage["batch.shipmentId"] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortStage[dbSortField] = sortOrder === "asc" ? 1 : -1;
    }

    // First, get the total count
    const countPipeline = [
      {
        $lookup: {
          from: "batches",
          foreignField: "_id",
          localField: "batchId",
          as: "batch",
        },
      },
      {
        $count: "total",
      },
    ];

    const countResult = await Retailer.aggregate(countPipeline);
    const totalItems = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Then, get the paginated data with sorting
    const dataPipeline = [
      {
        $lookup: {
          from: "batches",
          foreignField: "_id",
          localField: "batchId",
          as: "batch",
        },
      },
      {
        $project: {
          shipmentId: { $arrayElemAt: ["$batch.shipmentId", 0] },
          totalSoldBales: 1,
          totalReturnedBales: 1,
          createdAt: 1,
          batchId: 1,
        },
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
    ];

    const retailers = await Retailer.aggregate(dataPipeline);

    return NextResponse.json({
      success: true,
      message: "Retailers fetched successfully",
      retailers,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
      sorting: {
        field: sortField,
        order: sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching retailers:", error);
    return NextResponse.json(
      { success: false, message: "Error Getting Retailers" },
      { status: 500 }
    );
  }
}
