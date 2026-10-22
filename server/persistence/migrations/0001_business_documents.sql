-- Banco de NEGÓCIO separado. Não integra migrations/ de USERS_DB.
-- Aplicação por migração explícita; o Worker não cria tabelas em requisições.
CREATE TABLE business_documents (
  workspace_id TEXT NOT NULL,
  resource TEXT NOT NULL,
  record_id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  payload_version INTEGER NOT NULL CHECK (payload_version >= 1),
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  deleted INTEGER NOT NULL CHECK (deleted IN (0, 1)),
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  PRIMARY KEY (workspace_id, resource, record_id),
  CHECK (deleted = 0 OR payload_json = 'null')
);
CREATE INDEX business_documents_listing
  ON business_documents (workspace_id, resource, deleted, record_id);
