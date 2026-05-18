-- Task label chips for kanban cards (design system projects hub)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS labels text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS tasks_labels_gin ON tasks USING gin (labels);
