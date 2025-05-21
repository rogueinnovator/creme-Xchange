/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import getCurrentUser from "@/lib/features";
import CustomerSupport from "@/models/customerSupport.model";
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
    const query = user.userProfile === "admin" ? {} : { userId: user._id };

    const supportRequests = await CustomerSupport.find(query)
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        message: "support requests fetched successfully",
        supportRequests,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { category, description } = (await request.json()) as {
      category: string;
      description: string;
    };
    if (!category || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    await connectDB();

    const newSupportRequest = new CustomerSupport({
      userId: user._id,
      category,
      description,
    });

    await newSupportRequest.save();

    return NextResponse.json(
      {
        success: true,
        message: "Support request created successfully",
        supportRequest: newSupportRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message },
      { status: 500 }
    );
  }
}
