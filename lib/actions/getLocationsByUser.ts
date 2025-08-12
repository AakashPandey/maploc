"use server";

import { db } from "@/lib/db/db.config";
import { auth } from "@/lib/auth/authConfig";
import { locations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getLocationsByUser() {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to retrieve locations");
  }

  // Query DB
  const userLocations = await db
    .select({
      id: locations.id,
      name: locations.name,
      latitude: locations.latitude,
      longitude: locations.longitude,
      created_at: locations.created_at,
    })
    .from(locations)
    .where(eq(locations.user_id, session.user.id));

  return userLocations;
}