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
//         $in: ["upstream", "downstream", "wholesaler", "retailer"],
//       },
//       approved: false,
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
//       message: "Users Fetched successfully",
//       users,
//     });
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json(
//       { success: false, message: "Error Getting Users" },
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

    // Get sorting parameters
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("API received sort params:", { sortField, sortOrder });

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build query
    let query: any = {
      userProfile: {
        $in: ["upstream", "downstream", "wholesaler", "retailer"],
      },
      approved: false,
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

    // Create sort object for MongoDB
    const sort: Record<string, 1 | -1> = {};
    sort[dbSortField] = sortOrder === "asc" ? 1 : -1;

    // If sorting by name, add lastName as secondary sort
    if (dbSortField === "firstName") {
      sort["lastName"] = sortOrder === "asc" ? 1 : -1;
    }

    console.log("MongoDB sort object:", sort);

    // Get paginated users with sorting
    const rawUsers = await User.find(query)
      .select([
        "firstName",
        "lastName",
        "email",
        "country",
        "userProfile",
        "admin",
      ])
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
      totalUsers,
      totalPages,
      currentPage: page,
      appliedSort: { field: sortField, order: sortOrder },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Error getting users" },
      { status: 500 }
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

    const { userId, status }: { userId: string; status: boolean } =
      await request.json();

    const userFromDB = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    userFromDB.approved = status;

    await userFromDB.save();

    return NextResponse.json({
      success: true,
      message: "Users updated successfully successfully",
      user: userFromDB,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Error approving/rejecting user" },
      { status: 500 }
    );
  }
}
