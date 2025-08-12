"use server";

import { db } from "@/lib/db/db.config";
import { revalidatePath } from "next/cache";
import { locations } from "@/lib/db/schema";
import { z } from "zod";
const { auth } = await import("@/lib/auth/authConfig");


// Validation schema
const locationSchema = z.object({
  name: z.string().trim().min(1, "Location name is required").max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

type CreateLocationInput = z.infer<typeof locationSchema>;

export async function createLocation(input: CreateLocationInput) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a location");
  }
  // Validate input
  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map(e => e.message).join(", "));
  }

  // Insert into DB
  const [newLocation] = await db
    .insert(locations)
    .values({
      user_id: session.user.id,
      name: parsed.data.name,
      latitude: parsed.data.latitude.toString(),
      longitude: parsed.data.longitude.toString(),
    })
    .returning({ id: locations.id });

  revalidatePath("/map");
  return newLocation.id;
}