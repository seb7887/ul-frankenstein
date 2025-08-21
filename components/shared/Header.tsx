'use client';

import { useAuth } from '@/hooks/use-auth';
import { LoginButton } from '@/components/auth/LoginButton';
import Link from 'next/link';

export function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              UL Frankenstein
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-500 hover:text-gray-900">
              Home
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
                Dashboard
              </Link>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                )}
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  {user.email && (
                    <div className="text-xs text-gray-500">{user.email}</div>
                  )}
                </div>
              </div>
            )}
            <LoginButton showConfirmation={true} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}