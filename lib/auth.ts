import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";

// Note: Import authOptions directly from the route file in your API routes
// This file provides helper functions for getting user sessions

export async function getCurrentUser(authOptions: NextAuthOptions) {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth(authOptions: NextAuthOptions) {
  const user = await getCurrentUser(authOptions);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// For convenience, export the auth options type
export type { NextAuthOptions };
