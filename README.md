# Internship Test Submission

ส่งงานตามโจทย์ Internship Test V2

## Tech Stack (ส่วนที่ 3)

- **JavaScript + React** — แบ่งหน้าจอเป็น component และเก็บ state ผู้ใช้เพื่อแสดงหน้าตาม role
- **Vite** — dev server และ build สำหรับแอปขนาดเล็ก ตั้งค่าไม่มาก และรันผ่าน `npm run dev`; ใน PowerShell ใช้ `npm.cmd run dev` เพื่อเรียก Windows command shim โดยตรง
- **React Router** — จัดการ URL `/admin`, `/employee` และ redirect ตามสิทธิ์
- **React Context** — แชร์ผู้ใช้ที่ Login ระหว่าง route guard และหน้า โดยไม่เพิ่ม state library
- **CSS** — จัดหน้าจอ desktop/mobile โดยไม่เพิ่ม UI framework

ส่วนที่ 3 ใช้ mock API (Promise + `setTimeout`) จึงไม่ต้องมี backend หรือฐานข้อมูลจริง

## วิธีรันส่วนที่ 3

Vite ต้องใช้ Node.js 20.19+ หรือ 22.12+.

```bash
cd section-3
npm.cmd install
npm.cmd run dev
```

บน macOS/Linux ใช้ `npm install` และ `npm run dev` ได้ตามปกติ

เปิด URL ที่ Vite แสดงใน terminal (ปกติคือ `http://localhost:5173`)

### บัญชีทดสอบ

| Role | Username |
| --- | --- |
| Admin | `admin` |
| Employee | `employee1` |
| Employee | `employee2` |

หน้า Login มีคำแนะนำบัญชีและปุ่มเลือกบัญชีทดลอง พิมพ์ username อื่นเพื่อดู error ได้ ข้อมูล Task เป็น mock data และกลับสู่ค่าเริ่มต้นเมื่อ reload

## Database Design (ส่วนที่ 2)

สคีมาฐานข้อมูล PostgreSQL อยู่ที่ [`section-2/schema.sql`](section-2/schema.sql): ตาราง `users`, `projects`, `tasks` และ `audit_log` มี PK/FK, role/status constraints และ indexes สำหรับรายการงานตามผู้รับผิดชอบ โครงการ และสถานะ รวมถึงประวัติการเปลี่ยนสถานะ

## โครงสร้าง

- `section-1/` — System Design & Decision Log
- `section-2/` — Tech Stack & Database Design
- `section-3/` — Web Implementation
- `section-4/` — Debugging & Code Review

