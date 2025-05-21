import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { otp, email }: { otp: string; email: string } = await request.json();

    if (!otp || !email) {
      return NextResponse.json(
        { error: "OTP and Email are required" },
        { status: 400 }
      );
    }

    // Simulate OTP verification logic
    const user = await User.findOneAndUpdate(
      {
        email,
        otp,
        otpExpires: {
          $gt: Date.now(),
        },
      },
      {
        $unset: {
          otp: "",
          otpExpires: "",
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid OR Expired OTP" },
        { status: 401 }
      );
    }

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
