import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { useAuth } from './context/AuthContext.jsx';
import AppShell from './components/AppShell.jsx';
import AdminTasksPage from './pages/AdminTasksPage.jsx';
import EmployeeTasksPage from './pages/EmployeeTasksPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function ProtectedLayout({ requiredRole }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ notice: 'กรุณาเข้าสู่ระบบก่อนเปิดหน้านี้' }} />;
  }
  if (user.role !== requiredRole) {
    const roleLabel = user.role === 'admin' ? 'Admin' : 'Employee';
    return <Navigate to={`/${user.role}`} replace state={{ notice: `บัญชี ${roleLabel} ไม่มีสิทธิ์เปิด ${location.pathname}` }} />;
  }
  return <AppShell><Outlet /></AppShell>;
}

function IndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? `/${user.role}` : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout requiredRole="admin" />}>
        <Route path="/admin" element={<AdminTasksPage />} />
      </Route>
      <Route element={<ProtectedLayout requiredRole="employee" />}>
        <Route path="/employee" element={<EmployeeTasksPage />} />
      </Route>
      <Route path="*" element={<IndexRedirect />} />
    </Routes>
  );
}

