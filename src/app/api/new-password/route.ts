import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user.model";

export async function POST(request: NextRequest) {
  try {
    const { newPassword, email }: { newPassword: string; email: string } = await request.json();

    const hashPass = await bcrypt.hash(newPassword, 12);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: { password: hashPass },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to set new password",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "New password set successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "Failed to set new password",
    });
  }
}
