import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../api/client';

interface User { id: string; email: string; }

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout:   () => void;
  activePlanId: string | null;
  setActivePlanId: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePlanId, setActivePlanIdState] = useState<string | null>(
    localStorage.getItem('synapse_active_plan')
  );

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('synapse_token');
    if (stored) {
      setToken(stored);
      getMe()
        .then(({ user: u }) => setUser(u))
        .catch(() => { localStorage.removeItem('synapse_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persistAuth = (t: string, u: User) => {
    localStorage.setItem('synapse_token', t);
    setToken(t);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    persistAuth(res.token, res.user);
  };

  const register = async (email: string, password: string) => {
    const res = await apiRegister({ email, password });
    persistAuth(res.token, res.user);
  };

  const logout = () => {
    localStorage.removeItem('synapse_token');
    localStorage.removeItem('synapse_active_plan');
    setToken(null);
    setUser(null);
    setActivePlanIdState(null);
  };

  const setActivePlanId = (id: string) => {
    localStorage.setItem('synapse_active_plan', id);
    setActivePlanIdState(id);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, activePlanId, setActivePlanId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
