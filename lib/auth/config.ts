import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { supabaseClient } from "@/lib/supabase/supabaseClient";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days default
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mfaEnabled = user.mfaEnabled;

        // Handle remember me - extend session if requested
        if (account?.rememberMe === "true") {
          token.maxAge = 90 * 24 * 60 * 60; // 90 days
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.mfaEnabled = token.mfaEnabled as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: null, // Will disable the new account creation screen
  },
  secret: process.env.NEXTAUTH_SECRET,
};
