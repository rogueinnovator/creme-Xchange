/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import FineSorting from "@/models/fineSorting.model";
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

//     const batches = FineSorting.find()
//       .select([
//         "shipmentId",
//         "shipmentDate",
//         "arrivalDate",
//         "category",
//         "origin",
//         "destination",
//         "weight",
//       ])
//       .sort({ createdAt: -1 });
//     const batchesLists = await batches.exec();
//     return NextResponse.json({
//       success: true,
//       message: "Fine Sorting fetched successfully",
//       batchesLists,
//     });
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json(
//       { success: false, message: "Error Getting Fine Sorting" },
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
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};

    // Add search functionality if search parameter exists
    if (search) {
      query = {
        $or: [
          { shipmentId: { $regex: search, $options: "i" } },
          { locationOfShop: { $regex: search, $options: "i" } },
          { grade: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Get total count for pagination
    const totalBatches = await FineSorting.countDocuments(query);
    const totalPages = Math.ceil(totalBatches / limit);

    // Create sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Get paginated and sorted batches
    const batchesLists = await FineSorting.find(query)
      .select([
        "shipmentId",
        "noOfBags",
        "itemTypes",
        "locationOfShop",
        "grade",
      ])
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      message: "Fine Sorting fetched successfully",
      batchesLists,
      pagination: {
        totalItems: totalBatches,
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
    console.error("Error fetching fine sorting:", error);
    return NextResponse.json(
      { success: false, message: "Error Getting Fine Sorting" },
      { status: 500 }
    );
  }
}
