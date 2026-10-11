CREATE TABLE IF NOT EXISTS app_users (
 email TEXT PRIMARY KEY,
 role TEXT NOT NULL CHECK(role IN ('admin','user')),
 active INTEGER NOT NULL CHECK(active IN (0,1)),
 pages TEXT NOT NULL,
 can_import INTEGER NOT NULL CHECK(can_import IN (0,1)),
 can_export INTEGER NOT NULL CHECK(can_export IN (0,1)),
 version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL,
 updated_by TEXT NOT NULL
);
