// import { getToken } from "next-auth/jwt";
// import { type NextRequest, NextResponse } from "next/server";

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const isAuth = !!token;
//   const pathname = req.nextUrl.pathname;

//   const protectedPaths = ["/", "/admin"];
//   const isProtected = protectedPaths.some(
//     (path) => pathname === path || pathname.startsWith(`${path}/`)
//   );

//   if (isProtected && !isAuth) {
//     return NextResponse.redirect(new URL("/signin", req.url));
//   }

//   if (isAuth && pathname === "/signin") {
//     return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//   }

//   return NextResponse.next();
//   // const res = NextResponse.next();

//   // add the CORS headers to the response
//   // res.headers.append("Access-Control-Allow-Credentials", "true");
//   // const allowedOrigins = ["http://localhost:3000", "http://localhost:4000"];
//   // const origin = req.headers.get("origin");
//   // if (origin && allowedOrigins.includes(origin)) {
//   //   res.headers.append("Access-Control-Allow-Origin", origin);
//   // }
//   // res.headers.append(
//   //   "Access-Control-Allow-Methods",
//   //   "GET,DELETE,PATCH,POST,PUT"
//   // );
//   // res.headers.append(
//   //   "Access-Control-Allow-Headers",
//   //   "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
//   // );

//   // return res;

//   // return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/admin/:path*", "/signin"],
// };

// middleware.ts

import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  // const cookieName =
  //   process.env.NODE_ENV === "production"
  //     ? "__Secure-authjs.session-token"
  //     : "authjs.session-token";

  const cookieName = "authjs.session-token";

  const secure = process.env.NODE_ENV === "production" ? true : false;

  console.log(process.env.NODE_ENV, process.env.VERCEL_ENV);

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "Secret",
    cookieName: cookieName,
    salt: cookieName,
    secureCookie: secure,
  });

  console.log("Token  1: ", token);

  // if (token) {
  //   const decoded = jwt.verify(token!, process.env.NEXTAUTH_SECRET!);
  //   console.log(decoded);
  // }
  const pathname = req.nextUrl.pathname;

  // Example usage of decode with required params (replace 'yourToken' with an actual token if needed)

  // Protected paths
  if (
    ["/", "/admin", "/admin/:path*"].some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (token && pathname === "/signin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/signin"],
};

// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function middleware(req: NextRequest) {
//   const token =
//     req.cookies.get("authjs.session-token")?.value ||
//     req.cookies.get("__Secure-authjs.session-token")?.value;

//   console.log("Token : ", token);

//   const pathname = req.nextUrl.pathname;

//   // Protected paths
//   const protectedPaths = ["/", "/admin"];
//   const isProtected = protectedPaths.some(
//     (path) => pathname === path || pathname.startsWith(`${path}/`)
//   );

//   if (!token && isProtected) {
//     return NextResponse.redirect(new URL("/signin", req.url));
//   }

//   try {
//     if (token) {
//       const decoded = jwt.verify(token!, process.env.NEXTAUTH_SECRET!);
//       console.log("Decoded Token: ", decoded);
//     }

//     if (pathname === "/signin") {
//       return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//     }

//     return NextResponse.next();
//   } catch (err) {
//     console.error("Invalid or expired token:", err);
//     if (isProtected) {
//       return NextResponse.redirect(new URL("/signin", req.url));
//     }
//     return NextResponse.next();
//   }
// }

// export const config = {
//   matcher: ["/", "/admin/:path*", "/signin"],
// };
