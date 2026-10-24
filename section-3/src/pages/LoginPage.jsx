import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { loginAccounts } from '../api/mockApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('employee1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate(`/${user.role}`, { replace: true });
  }, [navigate, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const signedInUser = await login(username);
      navigate(`/${signedInUser.role}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <div className="login-brand"><span className="brand-mark">P</span> Project<span className="brand-light">Space</span></div>
        <p className="eyebrow">PROJECT ACCESS CONTROL</p>
        <h1>ยินดีต้อนรับ</h1>
        <p className="muted">เข้าสู่ระบบเพื่อดูและจัดการงานของคุณ</p>
        {location.state?.notice && <div className="notice" role="status">{location.state.notice}</div>}
        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">ชื่อผู้ใช้</label>
          <input id="username" name="username" list="login-accounts" autoComplete="username"
            value={username} onChange={(event) => setUsername(event.target.value)}
            placeholder="เช่น employee1" disabled={loading} />
          <datalist id="login-accounts">
            {loginAccounts.map((account) => <option key={account.username} value={account.username}>{account.displayName}</option>)}
          </datalist>
          <button className="button button-primary button-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" aria-hidden="true" /> กำลังเข้าสู่ระบบ...</> : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="demo-accounts">
          <p className="demo-title">บัญชีทดลอง · เลือกเพื่อเติม username</p>
          {loginAccounts.map((account) => (
            <button key={account.username} type="button" className="demo-account"
              onClick={() => setUsername(account.username)} disabled={loading}>
              <span><strong>{account.username}</strong><small>{account.displayName}</small></span>
              <span className="demo-role">{account.role}</span>
            </button>
          ))}
        </div>
      </section>
      <p className="login-caption">Mock API · Promise + setTimeout</p>
    </main>
  );
}

