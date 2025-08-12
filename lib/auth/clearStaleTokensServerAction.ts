"use server";

import { verificationToken } from "@/lib/db/schema";
import { lt } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
import { db } from "../db/db.config";

export const clearStaleTokens = async () => {
  try {
    await db
      .delete(verificationToken)
      .where(lt(verificationToken.expires, sql`NOW()`));
  } catch (error) {
    throw error;
  }
};
