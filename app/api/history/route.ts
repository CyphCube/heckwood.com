import { getUserId } from "@/lib/auth";
import { getDB } from "@/lib/db";

export const runtime = "edge";

type HistoryRow = {
  ep_key: string;
  show_slug: string;
  ep_slug: string;
  show_name: string | null;
  title: string | null;
  art: string | null;
  audio_url: string | null;
  position: number;
  duration: number;
  updated_at: number;
};

export async function GET() {
  const userId = await getUserId();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDB();
  if (!db) return Response.json({ history: [], server: false });

  const { results } = await db
    .prepare(
      "SELECT ep_key, show_slug, ep_slug, show_name, title, art, audio_url, position, duration, updated_at FROM history WHERE user_id = ? ORDER BY updated_at DESC LIMIT 200"
    )
    .bind(userId)
    .all<HistoryRow>();

  const history = results.map((r) => ({
    key: r.ep_key,
    showSlug: r.show_slug,
    epSlug: r.ep_slug,
    showName: r.show_name ?? "",
    title: r.title ?? "",
    art: r.art ?? "",
    audioUrl: r.audio_url ?? "",
    position: r.position,
    duration: r.duration,
    updatedAt: r.updated_at,
  }));

  return Response.json({ history, server: true });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDB();
  if (!db) return Response.json({ ok: true, server: false });

  const e = (await req.json()) as {
    key: string;
    showSlug: string;
    epSlug: string;
    showName?: string;
    title?: string;
    art?: string;
    audioUrl?: string;
    position: number;
    duration: number;
    updatedAt: number;
  };
  if (!e?.key) return Response.json({ error: "key required" }, { status: 400 });

  await db
    .prepare(
      `INSERT INTO history
        (user_id, ep_key, show_slug, ep_slug, show_name, title, art, audio_url, position, duration, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, ep_key) DO UPDATE SET
         position = excluded.position,
         duration = excluded.duration,
         updated_at = excluded.updated_at`
    )
    .bind(
      userId,
      e.key,
      e.showSlug,
      e.epSlug,
      e.showName ?? "",
      e.title ?? "",
      e.art ?? "",
      e.audioUrl ?? "",
      e.position ?? 0,
      e.duration ?? 0,
      e.updatedAt ?? Date.now()
    )
    .run();

  return Response.json({ ok: true, server: true });
}
