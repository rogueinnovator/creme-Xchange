/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./lib/db";
import UserModel from "./models/user.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "Secret",
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt({ token, user }: any) {
      if (user) token.user = user;
      return token;
    },
    session({ session, token }: any) {
      if (token) session.user = token.user as User;
      return session;
    },
    authorized({ auth }) {
      return !!auth.user;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          await connectDB();
          const { email, password } = credentials;

          if (!email || !password) {
            throw new Error("Invalid credentials.");
          }

          const userFromDB = await UserModel.findOne({ email }).select(
            "+password"
          );

          if (!userFromDB) {
            throw new Error("Invalid credentials.");
          }

          const isPassCorrect = await bcrypt.compare(
            password as string,
            userFromDB.password
          );

          if (!isPassCorrect) {
            throw new Error("Invalid credentials.");
          }

          const userObject = userFromDB.toObject();
          const { password: _, ...userWithoutPass } = userObject;

          console.log(userWithoutPass);
          return userWithoutPass as unknown as User;
        } catch (error: any) {
          console.log("authorize error", error);
          return null;
        }
      },
    }),
  ],
});
