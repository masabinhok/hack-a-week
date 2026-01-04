// ============================================
// FILE: contexts/AuthContext.tsx
// DESCRIPTION: Authentication context for citizen users
// ============================================

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  AuthUser,
  getProfile,
  logout as logoutApi,
  refreshTokens,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (authUser: AuthUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch {
        // Not authenticated or token expired
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Refresh tokens periodically (every 10 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await refreshTokens();
      } catch {
        // Token refresh failed, user needs to re-login
        setUser(null);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const login = useCallback((authUser: AuthUser) => {
    // After OTP verification, fetch full profile
    getProfile()
      .then(setUser)
      .catch(() => {
        // If profile fetch fails, use basic info from auth
        setUser({
          id: authUser.id,
          phoneNumber: authUser.phoneNumber,
          phoneVerified: true,
          email: authUser.email,
          emailVerified: false,
          fullName: authUser.fullName,
          nationalId: null,
          permanentProvinceId: null,
          permanentDistrictId: null,
          permanentMunicipalityId: null,
          permanentWardId: null,
          convenientProvinceId: null,
          convenientDistrictId: null,
          convenientMunicipalityId: null,
          convenientWardId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return {
    user,
    isLoading,
    isAuthenticated,
    isReady: !isLoading,
  };
}
