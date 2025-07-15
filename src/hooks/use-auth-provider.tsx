"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  useCallback,
} from "react";
import Spinner from "@/components/Spinner";

interface AuthContextType {
  accessToken: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setAccessToken(token);
      }
    } catch (error) {
      console.error("Could not read from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token: string) => {
    setAccessToken(token);
    try {
      localStorage.setItem("accessToken", token);
    } catch (error) {
       console.error("Could not write to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    try {
      localStorage.removeItem("accessToken");
    } catch (error) {
      console.error("Could not remove from localStorage", error);
    }
  }, []);
  
  const value = { accessToken, loading, login, logout };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
