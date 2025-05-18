"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/api-client';
import type { User, AuthResponse, ApiErrorResponse } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: Record<string, string>) => Promise<void>;
  register: (details: Record<string, string>) => Promise<void>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  updateUserInContext: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const initializeAuth = useCallback(() => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_DATA_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error initializing auth from localStorage:", error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleAuthSuccess = (data: AuthResponse) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
    router.push('/dashboard');
  };

  const login = async (credentials: Record<string, string>) => {
    try {
      const data = await apiClient<AuthResponse>('/auth/login', { data: credentials, method: 'POST' });
      handleAuthSuccess(data);
      toast({ title: "Login Successful", description: `Welcome back, ${data.user.username}!` });
    } catch (error) {
      const apiError = error as Error & { data?: ApiErrorResponse };
      toast({ title: "Login Failed", description: apiError.data?.message || apiError.message, variant: "destructive" });
      throw error;
    }
  };

  const register = async (details: Record<string, string>) => {
    try {
      const data = await apiClient<AuthResponse>('/auth/register', { data: details, method: 'POST' });
      handleAuthSuccess(data);
      toast({ title: "Registration Successful", description: `Welcome, ${data.user.username}!` });
    } catch (error) {
      const apiError = error as Error & { data?: ApiErrorResponse };
      toast({ title: "Registration Failed", description: apiError.data?.message || apiError.message, variant: "destructive" });
      throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    router.push('/login');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  }, [router, toast]);


  const fetchUserProfile = useCallback(async () => {
    if (!user?._id || !token) return;
    try {
      const fetchedUser = await apiClient<User>(`/users/${user._id}`, { token });
      setUser(fetchedUser);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(fetchedUser));
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Potentially logout if token is invalid (e.g., 401 error)
      const apiError = error as Error & { status?: number };
      if (apiError.status === 401) {
        logout();
      }
    }
  }, [user?._id, token, logout]);

  const updateUserInContext = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token && !!user;

  // Effect for redirecting if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !['/login', '/register'].includes(pathname)) {
        if (pathname !== '/') router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, register, logout, fetchUserProfile, updateUserInContext }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
