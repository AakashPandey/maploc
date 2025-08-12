"use server";

import { signOut } from "@/lib/auth/authConfig";

export const handleSignOut = async () => {
  try {
    await signOut({redirectTo:'/'});
  } catch (error) {
    throw error;
  }
};
