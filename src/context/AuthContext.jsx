import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";
import { useToast } from "./ToastContext";
const AuthContext = createContext(void 0);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("pulsefit_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("pulsefit_token");
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const refreshUser = async () => {
    const currentToken = localStorage.getItem("pulsefit_token");
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await API.get("/api/auth/me");
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("pulsefit_user", JSON.stringify(res.data.user));
      }
    } catch {
      localStorage.removeItem("pulsefit_token");
      localStorage.removeItem("pulsefit_user");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    refreshUser();
  }, []);
  const login = async (identifier, password) => {
    try {
      setIsLoading(true);
      const res = await API.post("/api/auth/login", { identifier, password });
      if (res.data?.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem("pulsefit_token", res.data.token);
        localStorage.setItem("pulsefit_user", JSON.stringify(res.data.user));
        showToast(`Welcome back, ${res.data.user.name}!`, "success");
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      showToast(msg, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (data) => {
    try {
      setIsLoading(true);
      const res = await API.post("/api/auth/register", data);
      if (res.data?.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem("pulsefit_token", res.data.token);
        localStorage.setItem("pulsefit_user", JSON.stringify(res.data.user));
        showToast("Registration successful! Welcome to PulseFit.", "success");
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please check inputs.";
      showToast(msg, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem("pulsefit_token");
    localStorage.removeItem("pulsefit_user");
    setUser(null);
    setToken(null);
    showToast("You have been logged out safely.", "info");
  };
  const updateUser = (updatedUser) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem("pulsefit_user", JSON.stringify(merged));
      return merged;
    });
  };
  return <AuthContext.Provider
    value={{
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      updateUser
    }}
  >
      {children}
    </AuthContext.Provider>;
};
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export {
  AuthProvider,
  useAuth
};
