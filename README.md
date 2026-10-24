# Internship Test Submission

ส่งงานตามโจทย์ Internship Test V2

## Tech Stack (ส่วนที่ 3)

- **JavaScript + React** — UI แบ่งเป็นหน้าและ component ได้ และใช้ state ตาม role เพื่อแสดงงานของ Admin หรือ Employee
- **Vite** — เปิด dev server สำหรับแอป React ได้ด้วยคำสั่ง `npm run dev` และมีการตั้งค่าน้อย เหมาะกับงานสาธิตขนาดเล็ก
- **React Router** — รองรับ URL `/admin` และ `/employee` พร้อม route guard และ redirect ตาม role ที่โจทย์กำหนด
- **React Context** — เก็บผู้ใช้ที่ Login อยู่ให้หน้าและ route guard อ่านร่วมกัน โดยไม่ต้องส่ง props ผ่านหลายชั้น
- **CSS** — จัดรูปแบบหน้าจอโดยไม่เพิ่ม UI framework ที่ไม่จำเป็นกับฟีเจอร์ชุดนี้

ส่วนที่ 3 ใช้ mock API ภายในแอป (Promise + `setTimeout`) ตามโจทย์ จึงไม่ต้องติดตั้ง backend หรือเชื่อมฐานข้อมูลจริง

## Database Design (ส่วนที่ 2)

สคีมาฐานข้อมูลจริงสำหรับ PostgreSQL อยู่ที่ [`section-2/schema.sql`](section-2/schema.sql):

- `users` เก็บชื่อผู้ใช้และ role พร้อม unique username และข้อจำกัด role ที่อนุญาต
- `projects` เก็บโครงการและผู้สร้าง โดยอ้างอิงผู้ใช้ด้วย foreign key
- `tasks` เก็บงาน โครงการ ผู้รับผิดชอบ สถานะ และเวลา พร้อม foreign key และ CHECK จำกัดสถานะเป็น `To Do` หรือ `Done`
- Indexes รองรับรายการงานทั้งหมด, งานในโครงการ, งานของพนักงาน และงานของพนักงานที่กรองตามสถานะ

## โครงสร้าง

- `section-1/` — System Design & Decision Log
- `section-2/` — Tech Stack & Database Design
- `section-3/` — Web Implementation
- `section-4/` — Debugging & Code Review

วิธีติดตั้ง วิธีรัน และบัญชีทดสอบจะเพิ่มเมื่อทำส่วนที่ 3 เสร็จ

