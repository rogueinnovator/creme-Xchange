/* eslint-disable @typescript-eslint/no-unused-vars */
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { ISignUpUser } from "@/types/index";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ISignUpUser;
    await connectDB();
    const existingEmail = await User.findOne({
      email: body.email,
    }).lean();
    if (existingEmail) {
      throw new Error("User with this email already exists");
    }
    const hashPass = await bcrypt.hash(body.password, 12);
    const newUser = await User.create({
      ...body,
      password: hashPass,
    });

    if (!newUser) {
      throw new Error("Failed to register user");
    }
    const userObj = newUser.toObject();
    userObj._id = userObj._id.toString();

    const { password: _, ...userWithoutPass } = userObj;
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: userWithoutPass,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
}
