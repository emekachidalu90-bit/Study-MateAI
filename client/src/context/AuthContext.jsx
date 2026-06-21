import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sm_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.get("/auth/me")
        .then(r => setUser(r.data))
        .catch(() => { localStorage.removeItem("sm_token"); delete api.defaults.headers.common["Authorization"]; })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("sm_token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("sm_token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sm_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try { const { data } = await api.get("/auth/me"); setUser(data); return data; }
    catch { return null; }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { data } = await api.put("/auth/me", updates);
    localStorage.setItem("sm_token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  }, []);

  const uploadAvatar = useCallback(async (file) => {
    const fd = new FormData();
    fd.append("avatar", file);
    const { data } = await api.post("/auth/me/avatar", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(data.user);
    return data.user;
  }, []);

  const removeAvatar = useCallback(async () => {
    const { data } = await api.delete("/auth/me/avatar");
    setUser(data.user);
    return data.user;
  }, []);

  const updateUser = useCallback((updates) => setUser(p => ({ ...p, ...updates })), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser, updateProfile, uploadAvatar, removeAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
