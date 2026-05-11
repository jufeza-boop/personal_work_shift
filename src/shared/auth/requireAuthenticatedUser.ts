"use server";

import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";

/**
 * Resolves the currently authenticated user and redirects to the login page
 * when no active session is found. Shared by all server action modules.
 */
export async function requireAuthenticatedUser(redirectTo: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}
