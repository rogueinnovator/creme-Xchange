import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import DownStreamFineSorting from "@/models/downStreamFineSorting.model";
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
//     const downstream = await DownStreamFineSorting.aggregate([
//       {
//         $lookup: {
//           from: "batches",
//           localField: "batchId",
//           foreignField: "_id",
//           as: "batch",
//         },
//       },
//       {
//         $project: {
//           totalItemsReceived: 1,
//           totalSaleableItems: 1,
//           totalStockReceived: 1,
//           totalReturnItems: 1,
//           fineSortingDetails: 1,
//           shipmentId: "$batch.shipmentId",
//         },
//       },
//       { $sort: { createdAt: -1 } },
//     ]);

//     return NextResponse.json({
//       success: true,
//       message: "Batches fetched successfully",
//       downstream,
//     });
//   } catch {
//     return NextResponse.json(
//       { success: false, message: "Error Getting Batches" },
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
      totalItemsReceived: "totalItemsReceived",
      totalSaleableItems: "totalSaleableItems",
      totalStockReceived: "totalStockReceived",
      totalReturnItems: "totalReturnItems",
      batchNumber: "batchNumber",
      dateReceived: "dateReceived",
      shipmentId: "shipmentId",
      // Add more mappings as needed
    };

    // Use the mapped field name or default to the original
    const dbSortField = fieldMapping[sortField] || sortField;

    // Create sort object for the aggregation
    const sortStage: Record<string, 1 | -1> = {};
    sortStage[dbSortField] = sortOrder === "asc" ? 1 : -1;

    // First, get the total count
    const countPipeline = [
      {
        $lookup: {
          from: "batches",
          localField: "batchId",
          foreignField: "_id",
          as: "batch",
        },
      },
      {
        $count: "total",
      },
    ];

    const countResult = await DownStreamFineSorting.aggregate(countPipeline);
    const totalItems = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Then, get the paginated data with sorting
    const dataPipeline = [
      {
        $lookup: {
          from: "batches",
          localField: "batchId",
          foreignField: "_id",
          as: "batch",
        },
      },
      {
        $project: {
          totalItemsReceived: 1,
          totalSaleableItems: 1,
          totalStockReceived: 1,
          totalReturnItems: 1,
          fineSortingDetails: 1,
          batchNumber: 1,
          dateReceived: 1,
          createdAt: 1,
          shipmentId: { $arrayElemAt: ["$batch.shipmentId", 0] },
        },
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
    ];

    const downstream = await DownStreamFineSorting.aggregate(dataPipeline);

    return NextResponse.json({
      success: true,
      message: "Batches fetched successfully",
      downstream,
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
    console.error("Error fetching downstream fine sorting data:", error);
    return NextResponse.json(
      { success: false, message: "Error Getting Batches" },
      { status: 500 }
    );
  }
}
