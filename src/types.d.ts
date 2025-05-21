import "next-auth";
import { IUser } from "./models/user.model";
declare module "next-auth" {
  interface Session {
    user: IUser & { _id: string };
  }
}
