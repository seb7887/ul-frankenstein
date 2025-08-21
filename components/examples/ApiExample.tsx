'use client';

import { useSecureGet, useSecurePost } from '@/hooks/use-secure-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateUserData {
  name: string;
  email: string;
}

export function ApiExample() {
  const [shouldFetch, setShouldFetch] = useState(false);
  
  // Example: GET request
  const {
    data: users,
    loading: usersLoading,
    error: usersError,
    execute: fetchUsers
  } = useSecureGet<User[]>('/users', undefined, {
    onSuccess: (data) => {
      console.log('Users fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to fetch users:', error);
    }
  });

  // Example: POST request
  const {
    data: newUser,
    loading: createLoading,
    error: createError,
    mutate: createUser
  } = useSecurePost<User, CreateUserData>('/users', {
    onSuccess: (data) => {
      console.log('User created successfully:', data);
      // Refetch users after creation
      fetchUsers();
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    }
  });

  const handleCreateUser = () => {
    createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Secure API Example</h2>
        
        <div className="space-y-4">
          <div>
            <Button 
              onClick={fetchUsers} 
              disabled={usersLoading}
              className="mr-2"
            >
              {usersLoading ? 'Loading...' : 'Fetch Users'}
            </Button>
            
            <Button 
              onClick={handleCreateUser} 
              disabled={createLoading}
              variant="outline"
            >
              {createLoading ? 'Creating...' : 'Create User'}
            </Button>
          </div>

          {usersError && (
            <div className="text-red-600 text-sm">
              Error: {usersError}
            </div>
          )}

          {createError && (
            <div className="text-red-600 text-sm">
              Create Error: {createError}
            </div>
          )}

          {users && (
            <div>
              <h3 className="font-medium mb-2">Users:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(users, null, 2)}
              </pre>
            </div>
          )}

          {newUser && (
            <div>
              <h3 className="font-medium mb-2">Newly Created User:</h3>
              <pre className="bg-green-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(newUser, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">How it works:</h3>
        <ul className="text-sm space-y-2 text-gray-600">
          <li>• Tokens are stored securely in HTTP-only cookies</li>
          <li>• All API calls go through Next.js BFF proxy at /api/proxy</li>
          <li>• Automatic token refresh handled server-side</li>
          <li>• No tokens exposed to browser JavaScript</li>
          <li>• CSRF protection via SameSite cookies</li>
          <li>• Enhanced security headers in middleware</li>
        </ul>
      </Card>
    </div>
  );
}