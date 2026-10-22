-- Bases imutáveis em partes e ponteiros publicados atomicamente. Não altera a agenda.
CREATE TABLE business_snapshots (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('orders','operational','logistics','monitoring')),
  payload_hash TEXT NOT NULL,
  part_count INTEGER NOT NULL CHECK(part_count BETWEEN 1 AND 512),
  byte_count INTEGER NOT NULL CHECK(byte_count BETWEEN 1 AND 16777216),
  state TEXT NOT NULL CHECK(state IN ('uploading','complete')),
  filename TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  completed_at TEXT,
  published_at TEXT
);
CREATE INDEX business_snapshots_by_kind ON business_snapshots(kind, state, created_at DESC, id);
CREATE TABLE business_snapshot_parts (
  snapshot_id TEXT NOT NULL REFERENCES business_snapshots(id) ON DELETE CASCADE,
  part_index INTEGER NOT NULL CHECK(part_index BETWEEN 0 AND 511),
  payload_text TEXT NOT NULL,
  PRIMARY KEY(snapshot_id, part_index)
);
CREATE TABLE business_snapshot_heads (
  kind TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES business_snapshots(id),
  revision INTEGER NOT NULL CHECK(revision > 0),
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);
CREATE TABLE business_publications (
  id TEXT PRIMARY KEY,
  selection_json TEXT NOT NULL CHECK(json_valid(selection_json)),
  valid INTEGER NOT NULL CHECK(valid = 1),
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);
CREATE TABLE business_collection_leases (
  name TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE TABLE business_monitoring_runs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('running','completed','failed')),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  snapshot_id TEXT REFERENCES business_snapshots(id),
  vehicle_count INTEGER,
  event_count INTEGER,
  failure_code TEXT
);
CREATE INDEX business_monitoring_runs_by_time ON business_monitoring_runs(started_at DESC);
CREATE TABLE business_monitoring_events (
  run_id TEXT NOT NULL REFERENCES business_monitoring_runs(id) ON DELETE CASCADE,
  event_index INTEGER NOT NULL,
  event_json TEXT NOT NULL CHECK(json_valid(event_json)),
  PRIMARY KEY(run_id,event_index)
);
