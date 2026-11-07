import { createContext, useContext, useEffect, useState } from 'react';
import { get, post, put, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, restore the session from the saved token
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = ({ token, user: u }) => {
    tokenStore.set(token);
    setUser(u);
    return u;
  };

  const login = (email, password) => post('/auth/login', { email, password }).then(handleAuth);
  const register = (form) => post('/auth/register', form).then(handleAuth);
  const updateProfile = (form) => put('/auth/me', form).then((d) => { setUser(d.user); return d.user; });
  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
