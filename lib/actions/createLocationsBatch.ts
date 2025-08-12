"use server";

import { db } from "@/lib/db/db.config";
import { revalidatePath } from "next/cache";
import { locations } from "@/lib/db/schema";
import { z } from "zod";
const { auth } = await import("@/lib/auth/authConfig");

// Validation schema for a single location
const locationSchema = z.object({
  name: z.string().trim().min(1, "Location name is required").max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Validation schema for batch
const batchSchema = z.array(locationSchema);

type BatchCreateLocationInput = z.infer<typeof batchSchema>;

export async function createLocationsBatch(input: BatchCreateLocationInput) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create locations");
  }

  // Validate input
  const parsed = batchSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map(e => e.message).join(", "));
  }

  // Map locations to DB values
  const valuesToInsert = parsed.data.map(loc => ({
    user_id: session.user!.id!, 
    name: loc.name,
    latitude: loc.latitude.toString(),
    longitude: loc.longitude.toString(),
  }));

  // Insert all in one query
  const inserted = await db
    .insert(locations)
    .values(valuesToInsert)
    .returning({ id: locations.id });

  revalidatePath("/map");
  return inserted.map(l => l.id);
}