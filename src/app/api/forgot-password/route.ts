import connectDB from "@/lib/db";
import { sendOTP } from "@/lib/sendOTP";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const [{ email }] = await Promise.all([
      request.json() as Promise<{ email: string }>,
      connectDB()
    ]);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 3600000);

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          otp,
          otpExpires,
        },
      },
      { new: true }
    ).lean();

    if (!user) {
      throw new Error("User with this email not found");
    }

    const res = await sendOTP({ email, otp });

    if (!res.success) {
      throw new Error("Error Sending OTP");
    }

    return NextResponse.json({
      success: true,
      message: "OTP Send Successfully",
    });
  } catch (error) {
    console.log("error send otp action", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
}
