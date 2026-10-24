-- PostgreSQL schema for Project Access Control.
-- IDs use identity columns so this schema needs no UUID extension.

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(120) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'employee')),
    CONSTRAINT users_username_not_blank CHECK (LENGTH(BTRIM(username)) > 0),
    CONSTRAINT users_display_name_not_blank CHECK (LENGTH(BTRIM(display_name)) > 0)
);

CREATE TABLE projects (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT projects_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT projects_name_not_blank CHECK (LENGTH(BTRIM(name)) > 0)
);

CREATE TABLE tasks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to BIGINT NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'To Do',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tasks_project_fkey
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE RESTRICT,
    CONSTRAINT tasks_assigned_to_fkey
        FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT tasks_status_check CHECK (status IN ('To Do', 'Done')),
    CONSTRAINT tasks_title_not_blank CHECK (LENGTH(BTRIM(title)) > 0)
);

-- Supports the Admin task list ordered by newest task first.
CREATE INDEX tasks_created_at_idx ON tasks (created_at DESC);

-- Supports project-scoped task lists ordered by creation time.
CREATE INDEX tasks_project_created_at_idx ON tasks (project_id, created_at DESC);

-- Supports an Employee's own task list when no status filter is selected.
CREATE INDEX tasks_assignee_created_at_idx ON tasks (assigned_to, created_at DESC);

-- Supports an Employee's task list filtered by status and ordered by creation time.
CREATE INDEX tasks_assignee_status_created_at_idx
    ON tasks (assigned_to, status, created_at DESC);

