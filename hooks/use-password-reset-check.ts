'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/use-auth';
import { useForceReset } from '@/hooks/use-force-reset';

export interface PasswordResetCheckState {
  isChecking: boolean;
  resetRequired: boolean;
  isProcessingReset: boolean;
  error: string | null;
  resetUrl: string | null;
}

export function usePasswordResetCheck() {
  const { user, isLoading: userLoading } = useUser();
  const { initiateReset, loading: resetLoading, error: resetError, resetUrl, redirectToReset } = useForceReset();
  
  const [state, setState] = useState<PasswordResetCheckState>({
    isChecking: false,
    resetRequired: false,
    isProcessingReset: false,
    error: null,
    resetUrl: null,
  });

  // Check if password reset is required by calling the API endpoint
  const checkPasswordResetRequired = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setState(prev => ({ ...prev, isChecking: true, error: null }));

      // Try to call the force-reset endpoint to check if reset is required
      const response = await fetch('/api/force-reset', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 400) {
        // Password reset not required
        return false;
      }

      if (response.ok) {
        // Password reset is required and ticket was created
        const data = await response.json();
        setState(prev => ({ 
          ...prev, 
          resetRequired: true, 
          resetUrl: data.reset_url 
        }));
        return true;
      }

      // Other errors (401, 500, etc.)
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check password reset requirement');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        resetRequired: false 
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, isChecking: false }));
    }
  }, [user]);

  // Automatically redirect to reset if URL is available
  const processAutomaticReset = useCallback(() => {
    if (state.resetUrl && state.resetRequired && !state.isProcessingReset) {
      setState(prev => ({ ...prev, isProcessingReset: true }));
      
      // Redirect to Auth0 password reset page
      window.location.href = state.resetUrl;
    }
  }, [state.resetUrl, state.resetRequired, state.isProcessingReset]);

  // Check for password reset requirement when user loads
  useEffect(() => {
    if (!userLoading && user && !state.isChecking && !state.resetRequired) {
      checkPasswordResetRequired();
    }
  }, [user, userLoading, checkPasswordResetRequired, state.isChecking, state.resetRequired]);

  // Process automatic reset when URL becomes available
  useEffect(() => {
    processAutomaticReset();
  }, [processAutomaticReset]);

  // Update state when useForceReset hook provides error
  useEffect(() => {
    if (resetError) {
      setState(prev => ({ ...prev, error: resetError }));
    }
  }, [resetError]);

  const retry = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: null, 
      resetRequired: false, 
      resetUrl: null,
      isProcessingReset: false 
    }));
    checkPasswordResetRequired();
  }, [checkPasswordResetRequired]);

  const isLoading = userLoading || state.isChecking || resetLoading || state.isProcessingReset;

  return {
    ...state,
    isLoading,
    retry,
    // Expose individual loading states for fine-grained control
    userLoading,
    resetLoading,
  };
}