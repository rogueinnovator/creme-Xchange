import { request } from "@/lib/request";
import { ISignInUser, ISignUpUser } from "@/types/index";

export const signIn = async (userData: ISignInUser) => {
  return request("/api/login", "POST", null, userData);
};
export const signUp = async (userData: ISignUpUser) => {
  return request("/api/signup", "POST", null, userData);
};
// services/api/auth.ts