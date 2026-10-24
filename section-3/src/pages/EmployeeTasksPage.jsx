import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { mockApi } from '../api/mockApi.js';
import { useAuth } from '../context/AuthContext.jsx';

function formatDate(value) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value));
}

export default function EmployeeTasksPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
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

  async function markDone(task) {
    setError(''); setSuccess(''); setPendingTaskId(task.id);
    try {
      const savedTask = await mockApi.updateTaskStatus(user, task.id, 'Done');
      setTasks((current) => current.map((item) => item.id === savedTask.id ? savedTask : item));
      setSuccess(`ทำ "${savedTask.title}" เสร็จแล้ว`);
    } catch (requestError) {
      setError(requestError.message || 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setPendingTaskId(null);
    }
  }

  const visibleTasks = useMemo(
    () => tasks.filter((task) => filter === 'All' || task.status === filter), [filter, tasks],
  );
  const remaining = tasks.filter((task) => task.status === 'To Do').length;

  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">MY WORKSPACE / EMPLOYEE</p><h1>งานของฉัน</h1>
        <p className="muted">ติดตามงานที่ได้รับมอบหมายและทำเครื่องหมายเมื่อเสร็จ</p></div>
        <div className="summary-card"><span className="summary-number">{remaining}</span><span>งานที่ยังต้องทำ</span></div>
      </section>
      {location.state?.notice && <div className="notice" role="status">{location.state.notice}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="status">{success}</div>}

      <section className="panel">
        <div className="panel-heading task-list-heading"><div><p className="eyebrow">YOUR TASKS</p><h2>รายการงาน</h2></div>
          <label className="filter-control">สถานะ
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="All">ทั้งหมด</option><option value="To Do">To Do</option><option value="Done">Done</option>
            </select>
          </label>
        </div>
        {loading ? <div className="loading-block"><span className="spinner spinner-dark" /> กำลังโหลดรายการ...</div>
          : visibleTasks.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">✓</span>
              <strong>{filter === 'All' ? 'ยังไม่มีงานที่ได้รับมอบหมาย' : `ไม่มีงานสถานะ ${filter}`}</strong>
              <span>เมื่อมีงานใหม่ งานจะแสดงที่หน้านี้</span></div>
          ) : (
            <div className="employee-task-list">{visibleTasks.map((task) => (
              <article className="employee-task" key={task.id}>
                <div className={`task-check ${task.status === 'Done' ? 'task-check-done' : ''}`}>{task.status === 'Done' ? '✓' : ''}</div>
                <div className="employee-task-main"><div className="employee-task-title"><h3>{task.title}</h3>
                  <span className={`status-badge ${task.status === 'Done' ? 'status-done' : 'status-todo'}`}><span />{task.status}</span></div>
                  <p>{task.projectName} <span className="dot-separator">·</span> สร้างเมื่อ {formatDate(task.createdAt)}</p>
                </div>
                {task.status === 'To Do' && <button className="button button-done" onClick={() => markDone(task)} disabled={pendingTaskId === task.id}>
                  {pendingTaskId === task.id ? <><span className="spinner" aria-hidden="true" /> กำลังบันทึก</> : 'ทำเสร็จแล้ว'}
                </button>}
              </article>
            ))}</div>
          )}
      </section>
    </>
  );
}

