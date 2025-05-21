export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export interface ISignInUser {
  email: string;
  password: string;
}

export interface ISignUpUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userProfile: string;
}
