import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeTasks() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState(null);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  useEffect(() => {
    let active = true;

    async function loadTasks(showInitialLoading = false) {
      const requestId = ++requestSequence.current;
      if (showInitialLoading) setLoading(true);
      else setRefreshing(true);

      try {
        const data = await api.getTasks(token);
        if (active && requestId === requestSequence.current) {
          setTasks(data.tasks);
          setError('');
        }
      } catch (requestError) {
        if (active && requestId === requestSequence.current) {
          setError(requestError.message || 'โหลดรายการไม่สำเร็จ กรุณาลองใหม่');
        }
      } finally {
        if (active && requestId === requestSequence.current) {
          if (showInitialLoading) setLoading(false);
          else setRefreshing(false);
        }
      }
    }

    void loadTasks(true);
    const timer = window.setInterval(() => { void loadTasks(); }, 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
      requestSequence.current += 1;
    };
  }, [token]);

  const visible = tasks.filter((task) =>
    String(task.assigned_to) === String(user.id) &&
    (filter === 'All' || task.status === filter)
  );

  async function markDone(task) {
    if (pendingTaskId === task.id) return;
    setError('');
    setPendingTaskId(task.id);
    setRefreshing(false);
    requestSequence.current += 1;

    try {
      const updatedTask = await api.updateStatus(token, task.id, 'Done');
      requestSequence.current += 1;
      setTasks((current) => current.map((item) =>
        String(item.id) === String(updatedTask.id) ? updatedTask : item
      ));
      setError('');
      setRefreshing(false);
    } catch (requestError) {
      requestSequence.current += 1;
      setError(requestError.message || 'อัปเดตไม่สำเร็จ กรุณาลองอีกครั้ง');
      setRefreshing(false);
    } finally {
      setPendingTaskId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MY TASKS</p>
          <h1>งานของฉัน</h1>
        </div>
        <label className="filter-control">สถานะ
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="All">ทั้งหมด</option>
            <option value="To Do">To Do</option>
            <option value="Done">Done</option>
          </select>
        </label>
      </div>

      {loading && <p role="status">กำลังโหลด...</p>}
      {!loading && refreshing && <p role="status">กำลังอัปเดตรายการ...</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {!loading && visible.length === 0 && <p>ไม่มี Task ในสถานะนี้</p>}
      <ul>
        {visible.map((task) => (
          <li key={task.id}>
            {task.title} — {task.status}
            {task.status === 'To Do' && (
              <button onClick={() => markDone(task)} disabled={pendingTaskId === task.id}>
                {pendingTaskId === task.id ? 'กำลังบันทึก...' : 'เปลี่ยนเป็น Done'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}


