const WAIT_MS = 450;

const users = [
  { id: 1, username: 'admin', displayName: 'Ariya Admin', role: 'admin' },
  { id: 2, username: 'employee1', displayName: 'Narin Employee', role: 'employee' },
  { id: 3, username: 'employee2', displayName: 'Mali Employee', role: 'employee' },
];

let tasks = [
  { id: 101, projectId: 1, projectName: 'Website Refresh', title: 'ออกแบบหน้าแรก', assignedTo: 2, status: 'To Do', createdAt: '2026-10-23T08:30:00.000Z' },
  { id: 102, projectId: 1, projectName: 'Website Refresh', title: 'ตรวจสอบเมนูบนมือถือ', assignedTo: 3, status: 'To Do', createdAt: '2026-10-23T09:00:00.000Z' },
  { id: 103, projectId: 1, projectName: 'Website Refresh', title: 'เตรียมภาพประกอบ', assignedTo: 2, status: 'Done', createdAt: '2026-10-23T10:00:00.000Z' },
  { id: 104, projectId: 2, projectName: 'Internal Tools', title: 'รวบรวมข้อเสนอแนะผู้ใช้', assignedTo: 3, status: 'To Do', createdAt: '2026-10-23T11:30:00.000Z' },
  { id: 105, projectId: 2, projectName: 'Internal Tools', title: 'จัดทำรายการสิทธิ์', assignedTo: 2, status: 'To Do', createdAt: '2026-10-23T13:15:00.000Z' },
];
let nextTaskId = 106;

function delay() {
  return new Promise((resolve) => setTimeout(resolve, WAIT_MS));
}
function copy(value) {
  return structuredClone(value);
}
function requireUser(user) {
  if (!user || !['admin', 'employee'].includes(user.role)) {
    throw new Error('กรุณาเข้าสู่ระบบใหม่');
  }
}

export const loginAccounts = users.map(({ id, username, displayName, role }) => ({
  id, username, displayName, role,
}));

export const mockApi = {
  async login(username) {
    await delay();
    const normalized = String(username ?? '').trim().toLowerCase();
    const user = users.find((candidate) => candidate.username === normalized);
    if (!user) throw new Error('ไม่พบบัญชีนี้ในระบบ ลอง admin, employee1 หรือ employee2');
    return copy(user);
  },

  async getTasks(user) {
    await delay();
    requireUser(user);
    const visibleTasks = user.role === 'admin'
      ? tasks
      : tasks.filter((task) => task.assignedTo === user.id);
    return copy(visibleTasks.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async createTask(user, { title, assignedTo }) {
    await delay();
    requireUser(user);
    if (user.role !== 'admin') throw new Error('เฉพาะ Admin เท่านั้นที่สร้าง Task ได้');

    const cleanTitle = String(title ?? '').trim();
    const assignee = users.find((candidate) => candidate.id === Number(assignedTo) && candidate.role === 'employee');
    if (!cleanTitle) throw new Error('กรุณากรอกชื่อ Task');
    if (!assignee) throw new Error('กรุณาเลือกพนักงานผู้รับผิดชอบ');

    const task = {
      id: nextTaskId++, projectId: 1, projectName: 'Website Refresh',
      title: cleanTitle, assignedTo: assignee.id, status: 'To Do', createdAt: new Date().toISOString(),
    };
    tasks = [task, ...tasks];
    return copy(task);
  },

  async updateTaskStatus(user, taskId, status) {
    await delay();
    requireUser(user);
    if (!['To Do', 'Done'].includes(status)) throw new Error('สถานะ Task ไม่ถูกต้อง');

    const task = tasks.find((candidate) => candidate.id === Number(taskId));
    if (!task) throw new Error('ไม่พบ Task นี้');
    if (user.role === 'employee') {
      if (task.assignedTo !== user.id) throw new Error('คุณเปลี่ยนสถานะได้เฉพาะ Task ที่ได้รับมอบหมาย');
      if (task.status !== 'To Do' || status !== 'Done') throw new Error('Employee เปลี่ยนได้เฉพาะ To Do เป็น Done');
    }

    task.status = status;
    return copy(task);
  },
};

