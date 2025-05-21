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

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "Secret",
  });

  console.log("Token : ", token);
  const pathname = req.nextUrl.pathname;

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
