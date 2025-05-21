/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import getCurrentUser from "@/lib/features";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const userFromDB = await User.findById(user._id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User fetched successfully",
      user: userFromDB,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const updateData = (await request.json()) as { [key: string]: any };

    // Don't allow role changes through profile update
    if (updateData.userProfile) {
      delete updateData.userProfile;
    }
    if (updateData.password) {
      delete updateData.password;
    }

    await connectDB();

    const userFromDB = await User.findById(user._id);

    if (!userFromDB) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user fields
    Object.keys(updateData).forEach((key) => {
      if (
        key !== "_id" &&
        key !== "createdAt" &&
        key !== "userProfile" &&
        key !== "password"
      ) {
        userFromDB[key] = updateData[key];
      }
    });

    const updatedUser = await userFromDB.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message },
      { status: 500 }
    );
  }
}
