import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/use-auth';
import { apiClient, ApiResponse, SecureApiClient } from '@/lib/api-client';

export interface UseSecureApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseSecureApiReturn<T> extends UseSecureApiState<T> {
  execute: () => Promise<ApiResponse<T>>;
  reset: () => void;
}

export interface UseSecureApiOptions {
  autoExecute?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

// Hook for GET requests
export function useSecureApi<T = any>(
  endpoint: string,
  params?: Record<string, any>,
  options: UseSecureApiOptions = {}
): UseSecureApiReturn<T> {
  const { user, isLoading: userLoading } = useUser();
  const [state, setState] = useState<UseSecureApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (): Promise<ApiResponse<T>> => {
    if (!user || userLoading) {
      const errorMsg = 'User not authenticated';
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      return { error: errorMsg, status: 401 };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.get<T>(endpoint, params);
      
      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          error: response.error!, 
          loading: false 
        }));
        options.onError?.(response.error);
      } else {
        setState(prev => ({ 
          ...prev, 
          data: response.data!, 
          loading: false 
        }));
        options.onSuccess?.(response.data);
      }
      
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        error: errorMsg, 
        loading: false 
      }));
      options.onError?.(errorMsg);
      return { error: errorMsg, status: 500 };
    }
  }, [endpoint, params, user, userLoading, options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for mutations (POST, PUT, PATCH, DELETE)
export function useSecureMutation<TData = any, TVariables = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options: UseSecureApiOptions = {}
) {
  const { user, isLoading: userLoading } = useUser();
  const [state, setState] = useState<UseSecureApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (variables?: TVariables): Promise<ApiResponse<TData>> => {
    if (!user || userLoading) {
      const errorMsg = 'User not authenticated';
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      return { error: errorMsg, status: 401 };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let response: ApiResponse<TData>;
      
      switch (method) {
        case 'POST':
          response = await apiClient.post<TData>(endpoint, variables);
          break;
        case 'PUT':
          response = await apiClient.put<TData>(endpoint, variables);
          break;
        case 'PATCH':
          response = await apiClient.patch<TData>(endpoint, variables);
          break;
        case 'DELETE':
          response = await apiClient.delete<TData>(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          error: response.error!, 
          loading: false 
        }));
        options.onError?.(response.error);
      } else {
        setState(prev => ({ 
          ...prev, 
          data: response.data!, 
          loading: false 
        }));
        options.onSuccess?.(response.data);
      }
      
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        error: errorMsg, 
        loading: false 
      }));
      options.onError?.(errorMsg);
      return { error: errorMsg, status: 500 };
    }
  }, [endpoint, method, user, userLoading, options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// Convenience hooks for specific HTTP methods
export function useSecureGet<T = any>(
  endpoint: string,
  params?: Record<string, any>,
  options?: UseSecureApiOptions
) {
  return useSecureApi<T>(endpoint, params, options);
}

export function useSecurePost<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseSecureApiOptions
) {
  return useSecureMutation<TData, TVariables>(endpoint, 'POST', options);
}

export function useSecurePut<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseSecureApiOptions
) {
  return useSecureMutation<TData, TVariables>(endpoint, 'PUT', options);
}

export function useSecurePatch<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseSecureApiOptions
) {
  return useSecureMutation<TData, TVariables>(endpoint, 'PATCH', options);
}

export function useSecureDelete<TData = any>(
  endpoint: string,
  options?: UseSecureApiOptions
) {
  return useSecureMutation<TData, never>(endpoint, 'DELETE', options);
}