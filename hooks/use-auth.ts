'use client';

import { useState, useEffect } from 'react';

interface User {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  [key: string]: any;
}

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.status === 401) {
          // Not authenticated
          setUser(null);
        } else if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          throw new Error('Failed to fetch user');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, isLoading, error };
}

export function useAuth() {
  const { user, error, isLoading } = useUser();
  
  const logout = () => {
    // Navigate to logout endpoint which will clear cookies and redirect to Auth0
    window.location.href = '/api/auth/logout';
  };

  const login = () => {
    // Navigate to login endpoint
    window.location.href = '/api/auth/login';
  };
  
  return {
    user,
    error,
    isLoading,
    isAuthenticated: !!user,
    logout,
    login,
  };
}