import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/use-auth';

export interface ForceResetState {
  loading: boolean;
  error: string | null;
  resetUrl: string | null;
  expiresAt: string | null;
}

export interface ForceResetResponse {
  reset_url: string;
  expires_at: string;
  user_id: string;
}

export function useForceReset() {
  const { user } = useUser();
  const [state, setState] = useState<ForceResetState>({
    loading: false,
    error: null,
    resetUrl: null,
    expiresAt: null,
  });

  const initiateReset = useCallback(async (): Promise<void> => {
    if (!user) {
      setState(prev => ({ 
        ...prev, 
        error: 'User not authenticated' 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));

    try {
      const response = await fetch('/api/force-reset', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate password reset');
      }

      const data: ForceResetResponse = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
        resetUrl: data.reset_url,
        expiresAt: data.expires_at,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [user]);

  const redirectToReset = useCallback(() => {
    if (state.resetUrl) {
      window.location.href = state.resetUrl;
    }
  }, [state.resetUrl]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      resetUrl: null,
      expiresAt: null,
    });
  }, []);

  return {
    ...state,
    initiateReset,
    redirectToReset,
    clearError,
    reset,
    canRedirect: Boolean(state.resetUrl && !state.loading && !state.error),
  };
}