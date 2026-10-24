const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const ALLOWED_STATUSES = ['To Do', 'Done'];
const PAGE_SIZE = 20;

function parsePositiveInteger(value) {
  if (Array.isArray(value) || value === undefined || value === null || String(value).trim() === '') return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function parsePositiveId(value) {
  if (Array.isArray(value) || value === undefined || value === null) return null;
  const normalized = String(value);
  return /^[1-9]\d*$/.test(normalized) ? normalized : null;
}

router.get('/api/tasks', authenticate, async (req, res) => {
  const page = parsePositiveInteger(req.query.page ?? 1);
  const projectId = req.query.projectId === undefined ? null : parsePositiveId(req.query.projectId);
  const userId = parsePositiveId(req.user.id);

  if (!page || !Number.isSafeInteger((page - 1) * PAGE_SIZE)) {
    return res.status(400).json({ message: 'Page must be a positive integer' });
  }
  if (req.query.projectId !== undefined && !projectId) {
    return res.status(400).json({ message: 'Invalid projectId' });
  }
  if (!userId || !['admin', 'employee'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Invalid user identity' });
  }

  try {
    const conditions = [];
    const params = [];

    if (projectId) {
      params.push(projectId);
      conditions.push(`project_id = $${params.length}`);
    }
    if (req.user.role === 'employee') {
      params.push(userId);
      conditions.push(`assigned_to = $${params.length}`);
    }

    let sql = 'SELECT * FROM tasks';
    if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
    params.push(PAGE_SIZE);
    const limitParameter = params.length;
    params.push((page - 1) * PAGE_SIZE);
    const offsetParameter = params.length;
    sql += ` ORDER BY created_at DESC LIMIT $${limitParameter} OFFSET $${offsetParameter}`;

    const result = await db.query(sql, params);
    return res.status(200).json({ tasks: result.rows, page });
  } catch (err) {
    console.error('GET /api/tasks failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  const taskId = parsePositiveId(req.params.id);
  const status = req.body?.status;
  if (!taskId) return res.status(400).json({ message: 'Invalid task id' });
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  let client;
  let transactionStarted = false;
  try {
    client = await db.connect();
    await client.query('BEGIN');
    transactionStarted = true;

    const { rows } = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [taskId]);
    const task = rows[0];
    if (!task) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isEmployee = req.user.role === 'employee';
    if (!isAdmin && !isEmployee) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(403).json({ message: 'Invalid user role' });
    }

    const isOwner = String(task.assigned_to) === String(req.user.id);
    if (!isAdmin && !isOwner) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(403).json({ message: 'No permission to edit this task' });
    }
    if (isEmployee && !(task.status === 'To Do' && status === 'Done')) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(409).json({ message: 'Employee can only change To Do to Done' });
    }

    const updated = await client.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, taskId]
    );
    const updatedTask = updated.rows[0];
    if (!updatedTask) throw new Error('Task disappeared while updating');

    await client.query(
      'INSERT INTO audit_log (task_id, user_id, action) VALUES ($1, $2, $3)',
      [taskId, req.user.id, `status:${status}`]
    );
    await client.query('COMMIT');
    transactionStarted = false;

    return res.status(200).json({ task: updatedTask });
  } catch (err) {
    if (client && transactionStarted) {
      try { await client.query('ROLLBACK'); } catch (rollbackError) {
        console.error('PATCH rollback failed:', rollbackError);
      }
    }
    console.error('PATCH /api/tasks/:id/status failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

router.delete('/api/tasks/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  const taskId = parsePositiveId(req.params.id);
  if (!taskId) return res.status(400).json({ message: 'Invalid task id' });

  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [taskId]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Task not found' });
    return res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/tasks/:id failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

