/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import User from "@/models/user.model";
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

//     const rawUsers = await User.find({
//       userProfile: {
//         $in: ["upstream", "downstream", "retailer", "wholesaler"],
//       },
//     })
//       .select(["firstName", "lastName", "email", "country", "userProfile"])
//       .sort({ createdAt: -1 })
//       .lean();

//     // Rename firstName to name in each user object
//     const users = rawUsers.map((user: any) => {
//       user.name = `${user.firstName} ${user.lastName}`;
//       user.profile = user.userProfile;

//       delete user.firstName;
//       delete user.lastName;
//       delete user.userProfile;

//       return user;
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Users fetched successfully",
//       users,
//     });
//   } catch (error: any) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: error?.message || "Error Getting users",
//       },
//       {
//         status: 500,
//       }
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
    let query: any = {
      userProfile: {
        $in: ["upstream", "downstream", "retailer", "wholesaler"],
      },
    };

    // Add search functionality if search parameter exists
    if (search) {
      query = {
        ...query,
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { country: { $regex: search, $options: "i" } },
          { userProfile: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    // Map frontend field names to database field names
    const fieldMapping: Record<string, string> = {
      name: "firstName", // Sort by firstName when "name" is requested
      email: "email",
      country: "country",
      profile: "userProfile",
    };

    // Use the mapped field name or default to the original
    const dbSortField = fieldMapping[sortField] || sortField;

    // Create sort object
    const sort: Record<string, 1 | -1> = {};
    sort[dbSortField] = sortOrder === "asc" ? 1 : -1;

    // If sorting by name, add lastName as secondary sort
    if (dbSortField === "firstName") {
      sort["lastName"] = sortOrder === "asc" ? 1 : -1;
    }

    // Get paginated and sorted users
    const rawUsers = await User.find(query)
      .select(["firstName", "lastName", "email", "country", "userProfile"])
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform user data
    const users = rawUsers.map((user: any) => {
      return {
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        country: user.country,
        profile: user.userProfile,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Users fetched successfully",
      users,
      pagination: {
        totalItems: totalUsers,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
      sorting: {
        field: sortField,
        order: sortOrder,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Error Getting users",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user || user.userProfile !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { userId, newRole }: { userId: string; newRole: string } =
      await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { success: false, message: "User ID and new role are required" },
        { status: 400 }
      );
    }

    if (newRole === "admin") {
      return NextResponse.json(
        { success: false, message: "Can not set admin as user role" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          userProfile: newRole,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.log("Error Updating user role : ", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Error updating role of user",
      },
      {
        status: 500,
      }
    );
  }
}
