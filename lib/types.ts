// Auth0 user type based on JWT payload
export interface User {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
  updated_at?: string;
  [key: string]: any; // Allow for custom claims
}

// API Response types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Session types
export interface SessionInfo {
  user: User;
  accessToken?: string;
  accessTokenExpiresAt?: number;
  refreshToken?: string;
}

// BFF Proxy types
export interface ProxyRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface ProxyResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  headers?: Record<string, string>;
}