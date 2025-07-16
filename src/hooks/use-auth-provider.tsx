
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
import { User } from "@/lib/types";

// Helper to decode JWT
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setAccessToken(token);
        const decodedToken = decodeJwt(token);
        if (decodedToken && decodedToken.sub) {
            setUser({ email: decodedToken.sub });
        }
      }
    } catch (error) {
      console.error("Could not read from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token: string) => {
    setAccessToken(token);
    const decodedToken = decodeJwt(token);
    if (decodedToken && decodedToken.sub) {
        setUser({ email: decodedToken.sub });
    }
    try {
      localStorage.setItem("accessToken", token);
    } catch (error) {
       console.error("Could not write to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    try {
      localStorage.removeItem("accessToken");
    } catch (error) {
      console.error("Could not remove from localStorage", error);
    }
  }, []);
  
  const value = { accessToken, user, loading, login, logout };

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
