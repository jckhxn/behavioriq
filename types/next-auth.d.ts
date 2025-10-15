import { DefaultSession, DefaultUser, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
    mfaEnabled?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      mfaEnabled?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    mfaEnabled?: boolean;
  }
}
