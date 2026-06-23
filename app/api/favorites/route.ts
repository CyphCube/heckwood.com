import { getUserId } from "@/lib/auth";
import { getDB } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDB();
  if (!db) return Response.json({ favorites: [], server: false });

  const { results } = await db
    .prepare("SELECT show_slug FROM favorites WHERE user_id = ? ORDER BY created_at DESC")
    .bind(userId)
    .all<{ show_slug: string }>();

  return Response.json({
    favorites: results.map((r) => r.show_slug),
    server: true,
  });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDB();
  if (!db) return Response.json({ ok: true, server: false });

  const { showSlug, favorite } = (await req.json()) as {
    showSlug?: string;
    favorite?: boolean;
  };
  if (!showSlug) return Response.json({ error: "showSlug required" }, { status: 400 });

  if (favorite) {
    await db
      .prepare(
        "INSERT OR IGNORE INTO favorites (user_id, show_slug, created_at) VALUES (?, ?, ?)"
      )
      .bind(userId, showSlug, Date.now())
      .run();
  } else {
    await db
      .prepare("DELETE FROM favorites WHERE user_id = ? AND show_slug = ?")
      .bind(userId, showSlug)
      .run();
  }

  return Response.json({ ok: true, server: true });
}
