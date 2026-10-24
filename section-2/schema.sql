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

-- Keeps a durable record of task status changes made by authenticated users.
-- task_id becomes NULL if an Admin deletes the task, preserving the audit event.
CREATE TABLE audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id BIGINT,
    user_id BIGINT NOT NULL,
    action VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT audit_log_task_fkey
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL,
    CONSTRAINT audit_log_user_fkey
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT audit_log_action_not_blank CHECK (LENGTH(BTRIM(action)) > 0)
);

-- Supports retrieving a task's audit history in chronological order.
CREATE INDEX audit_log_task_created_at_idx ON audit_log (task_id, created_at DESC);

-- Supports retrieving actions performed by a user in chronological order.
CREATE INDEX audit_log_user_created_at_idx ON audit_log (user_id, created_at DESC);

-- Supports the Admin task list ordered by newest task first.
CREATE INDEX tasks_created_at_idx ON tasks (created_at DESC);

-- Supports project-scoped task lists ordered by creation time.
CREATE INDEX tasks_project_created_at_idx ON tasks (project_id, created_at DESC);

-- Supports an Employee's own task list when no status filter is selected.
CREATE INDEX tasks_assignee_created_at_idx ON tasks (assigned_to, created_at DESC);

-- Supports an Employee's task list filtered by status and ordered by creation time.
CREATE INDEX tasks_assignee_status_created_at_idx
    ON tasks (assigned_to, status, created_at DESC);

