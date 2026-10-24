import { createContext, useContext, useMemo, useState } from 'react';
import { mockApi } from '../api/mockApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({
    user,
    async login(username) {
      const signedInUser = await mockApi.login(username);
      setUser(signedInUser);
      return signedInUser;
    },
    logout() { setUser(null); },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth ต้องใช้ภายใน AuthProvider');
  return context;
}

