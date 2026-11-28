import "next-auth";
import "next-auth/jwt";
import type { RoleUserType } from "@/types";

declare module "next-auth" {
  interface User {
    id: string;
    ssoSub: string;
    name: string;
    email: string;
    nipNim: string;
    role: RoleUserType;
    ssoRawRole: string;
    accessTokenExpires: number;
    refreshToken?: string;
  }

  interface Session {
    user: {
      id: string;
      ssoSub: string;
      name: string;
      email: string;
      nipNim: string;
      role: RoleUserType;
      ssoRawRole: string;
    };
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    ssoSub: string;
    name: string;
    email: string;
    nipNim: string;
    role: RoleUserType;
    ssoRawRole: string;
    accessTokenExpires: number;
    refreshToken?: string;
    error?: "RefreshAccessTokenError";
  }
}
