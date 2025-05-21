/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestMethod } from "../types/index";
export const request = async <T = any>(
  url: string,
  method: RequestMethod,
  headers?: Record<string, string>,
  data?: unknown,
  isFormData?: boolean
): Promise<T> => {
  const fetchOptions: any = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },

    body:
      data !== undefined && method.toUpperCase() !== "GET"
        ? isFormData
          ? (data as FormData)
          : JSON.stringify(data)
        : undefined,
  };

  if (isFormData) {
    delete (fetchOptions.headers as Record<string, string>)["Content-Type"];
  }
  const response = await fetch(url, fetchOptions);
  const responseBody = await response.json();
  if (!response.ok) {
    const message =
      (responseBody as any)?.message ||
      response.statusText ||
      "Something went wrong";
    throw new Error(message);
  }
  return (await responseBody) as T;
};
