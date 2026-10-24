import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true, state: { notice: 'ออกจากระบบแล้ว' } });
  }

  return (
    <div className="app-frame">
      <header className="topbar">
        <Link className="brand" to={isAdmin ? '/admin' : '/employee'} aria-label="หน้าหลัก">
          <span className="brand-mark">P</span>
          <span>Project<span className="brand-light">Space</span></span>
        </Link>
        <div className="account-area">
          <span className="role-pill">{isAdmin ? 'ADMIN' : 'EMPLOYEE'}</span>
          <span className="account-name">{user?.displayName}</span>
          <button className="button button-quiet button-small" onClick={handleLogout}>ออกจากระบบ</button>
        </div>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer-note">ตัวอย่างระบบจัดการงาน · ข้อมูลจำลองสำหรับการทดสอบ</footer>
    </div>
  );
}

