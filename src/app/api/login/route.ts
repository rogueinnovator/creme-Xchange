import { signIn } from "@/auth";
import { NextResponse } from "next/server";

interface Credentials {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const credentials: Credentials = await request.json();
    const { email, password } = credentials;

    console.log(email, password);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await signIn("credentials", {
      redirect: false,

      email,
      password,

      // redirectTo: "/admin/dashboard",
    });

    console.log("Login Result : ", result);
    if (result?.error) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Logged in successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && {
          debug: error instanceof Error ? error.message : "Unknown error",
        }),
      },
      { status: 500 }
    );
  }
}
