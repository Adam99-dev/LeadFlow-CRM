import { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { apiRequest, setWorkspaceId } from "../lib/api.js";

const AuthContext = createContext();

// =========================================
// CUSTOM HOOK
// =========================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

// =========================================
// PROVIDER
// =========================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // =========================================
  // CHECK AUTH STATUS
  // =========================================

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/auth/me");
      setUser(data.user);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // INITIAL AUTH CHECK
  // =========================================

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // =========================================
  // LOGIN
  // =========================================

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email: email.trim(), password },
      });

      setUser(data.user);
      setIsAuthenticated(true);
      toast.success("Login successful!");

      return { success: true, user: data.user };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // REGISTER
  // =========================================

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: { name: name.trim(), email: email.trim(), password },
      });

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOGOUT
  // =========================================

  const logout = async () => {
    try {
      setLoading(true);
      await apiRequest("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsAuthenticated(false);
      setWorkspaceId(null);
      toast.success("Logged out successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // CONTEXT VALUE
  // =========================================

  const value = {
    user,
    loading,
    isAuthenticated,

    login,
    register,
    logout,

    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
