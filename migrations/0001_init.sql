-- Heckwood app data. Identity is owned by Clerk; we only store the Clerk user id.

CREATE TABLE IF NOT EXISTS favorites (
  user_id    TEXT    NOT NULL,
  show_slug  TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, show_slug)
);

CREATE TABLE IF NOT EXISTS history (
  user_id    TEXT    NOT NULL,
  ep_key     TEXT    NOT NULL,            -- `${showSlug}/${epSlug}`
  show_slug  TEXT    NOT NULL,
  ep_slug    TEXT    NOT NULL,
  show_name  TEXT,
  title      TEXT,
  art        TEXT,
  audio_url  TEXT,
  position   REAL    NOT NULL DEFAULT 0,  -- seconds
  duration   REAL    NOT NULL DEFAULT 0,  -- seconds
  updated_at INTEGER NOT NULL,            -- epoch ms
  PRIMARY KEY (user_id, ep_key)
);

CREATE INDEX IF NOT EXISTS idx_history_user_updated
  ON history (user_id, updated_at DESC);
