import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { loginAccounts, mockApi } from '../api/mockApi.js';
import { useAuth } from '../context/AuthContext.jsx';

function formatDate(value) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value));
}

export default function AdminTasksPage() {
  const { user } = useAuth();
  const location = useLocation();
  const employees = loginAccounts.filter((account) => account.role === 'employee');
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState(String(employees[0]?.id ?? ''));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    mockApi.getTasks(user)
      .then((result) => { if (active) setTasks(result); })
      .catch((requestError) => { if (active) setError(requestError.message || 'โหลดรายการ Task ไม่สำเร็จ'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  async function handleCreate(event) {
    event.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const newTask = await mockApi.createTask(user, { title, assignedTo: assigneeId });
      setTasks((current) => [newTask, ...current]);
      setTitle(''); setSuccess('สร้าง Task แล้ว');
    } catch (requestError) {
      setError(requestError.message || 'สร้าง Task ไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(task, status) {
    setError(''); setSuccess(''); setPendingTaskId(task.id);
    try {
      const savedTask = await mockApi.updateTaskStatus(user, task.id, status);
      setTasks((current) => current.map((item) => item.id === savedTask.id ? savedTask : item));
    } catch (requestError) {
      setError(requestError.message || 'เปลี่ยนสถานะไม่สำเร็จ');
    } finally {
      setPendingTaskId(null);
    }
  }

  const employeeName = (id) => employees.find((employee) => employee.id === id)?.displayName ?? 'ไม่ทราบ';

  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">WORKSPACE / ADMIN</p><h1>จัดการ Task</h1>
          <p className="muted">ดูงานทั้งหมด มอบหมายงาน และจัดการสถานะได้จากที่เดียว</p></div>
        <div className="summary-card"><span className="summary-number">{tasks.length}</span><span>Task ทั้งหมด</span></div>
      </section>
      {location.state?.notice && <div className="notice" role="status">{location.state.notice}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="status">{success}</div>}

      <section className="panel create-panel">
        <div className="panel-heading"><div><p className="eyebrow">NEW TASK</p><h2>สร้าง Task ใหม่</h2></div><span className="panel-icon">＋</span></div>
        <form className="create-form" onSubmit={handleCreate}>
          <div className="field field-grow"><label htmlFor="task-title">ชื่อ Task</label>
            <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120}
              placeholder="เช่น ตรวจสอบคุณภาพหน้าเว็บ" required disabled={submitting} /></div>
          <div className="field assignee-field"><label htmlFor="task-assignee">ผู้รับผิดชอบ</label>
            <select id="task-assignee" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} disabled={submitting}>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.displayName}</option>)}
            </select></div>
          <button className="button button-primary create-button" type="submit" disabled={submitting || loading}>
            {submitting ? <><span className="spinner" aria-hidden="true" /> กำลังสร้าง...</> : 'สร้าง Task'}
          </button>
        </form>
      </section>

      <section className="panel task-panel">
        <div className="panel-heading task-list-heading"><div><p className="eyebrow">TASK OVERVIEW</p><h2>งานทั้งหมด</h2></div>
          <span className="count-pill">{tasks.length} รายการ</span></div>
        {loading ? <div className="loading-block"><span className="spinner spinner-dark" /> กำลังโหลดรายการ...</div>
          : tasks.length === 0 ? <p className="empty-state">ยังไม่มี Task ในระบบ</p> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Task</th><th>โครงการ</th><th>ผู้รับผิดชอบ</th><th>สถานะ</th><th>วันที่สร้าง</th><th>จัดการสถานะ</th></tr></thead>
              <tbody>{tasks.map((task) => (
                <tr key={task.id}>
                  <td><strong>{task.title}</strong><small className="task-id">TASK-{task.id}</small></td>
                  <td>{task.projectName}</td><td>{employeeName(task.assignedTo)}</td>
                  <td><span className={`status-badge ${task.status === 'Done' ? 'status-done' : 'status-todo'}`}><span />{task.status}</span></td>
                  <td>{formatDate(task.createdAt)}</td>
                  <td><button className="button button-quiet button-small" disabled={pendingTaskId === task.id}
                    onClick={() => handleStatusChange(task, task.status === 'Done' ? 'To Do' : 'Done')}>
                    {pendingTaskId === task.id ? 'กำลังบันทึก...' : task.status === 'Done' ? 'เปลี่ยนเป็น To Do' : 'เปลี่ยนเป็น Done'}
                  </button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
      </section>
    </>
  );
}

