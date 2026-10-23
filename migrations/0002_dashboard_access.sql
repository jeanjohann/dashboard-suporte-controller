-- NULL conserva a regra anterior. Nenhuma concessão ou revogação é feita nesta migração.
ALTER TABLE app_users ADD COLUMN can_dashboard INTEGER DEFAULT NULL CHECK(can_dashboard IN (0,1));
