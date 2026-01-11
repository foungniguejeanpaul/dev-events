import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database";
import type { EventDocument } from "@/database";

/**
 * Normalize and validate the slug from the URL.
 */
function normalizeSlug(rawSlug: string | undefined): string {
  const value = rawSlug?.trim();
  if (!value) {
    throw new Error("Slug is required.");
  }
  return value;
}

/**
 * GET /api/events/[slug]
 * Next 16 : params est une Promise, donc on doit await
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // ✅ Await params pour Next 16
    const { slug } = await params;
    const normalizedSlug = normalizeSlug(slug);

    // ✅ Connexion MongoDB
    await connectToDatabase();

    // ✅ Cherche l’event par slug
    const event: EventDocument | null = await Event.findOne({ slug: normalizedSlug }).lean();

    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Slug is required.") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("[GET /api/events/[slug]]", error);

    return NextResponse.json(
      { message: "An unexpected error occurred while fetching the event." },
      { status: 500 }
    );
  }
}
