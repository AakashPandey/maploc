"use server";

import { signIn } from "@/lib/auth/authConfig";

export const handleGoogleSignIn = async (returnUrl?: string | null) => {
  try {
    await signIn("google", { redirectTo: returnUrl || "/" });
  } catch (error) {
    throw error;
  }
};