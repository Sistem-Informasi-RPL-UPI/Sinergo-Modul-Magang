import axios, { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import type { ApiResponse } from "@/types";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<null>>) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      !window.location.pathname.startsWith("/api/auth")
    ) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      void signIn("sacibiru", { callbackUrl: currentPath });
    }
    return Promise.reject(error);
  },
);
