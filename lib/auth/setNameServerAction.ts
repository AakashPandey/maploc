"use server";

import { auth } from "@/lib/auth/authConfig";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/db.config";

export const setName = async (name: string) => {
  // Check if the user is authenticated
  const session = await auth();
  if (session === null) {
    throw new Error("Unauthorized");
  }

  const uuid: string = session.user!.id!;

  // Sanitize UUID
  const uuidRegExp: RegExp =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  if (!uuidRegExp.test(uuid)) {
    throw new Error("Invalid UUID");
  }

  // Sanitize name
  name = name.trim();

  // Update the user's name in the database using Drizzle
  await db
    .update(users)
    .set({ name })
    .where(eq(users.id, uuid));

  return true;
};
