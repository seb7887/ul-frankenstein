'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { LogOut, Loader2 } from 'lucide-react';

interface LoginButtonProps {
  showConfirmation?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function LoginButton({ 
  showConfirmation = false, 
  variant = 'destructive',
  size = 'default',
  className = ''
}: LoginButtonProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Navigate to logout endpoint
    window.location.href = '/api/auth/logout';
  };

  if (isLoading) {
    return (
      <Button disabled size={size} className={className}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isAuthenticated) {
    const LogoutButton = (
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        disabled={isLoggingOut}
        onClick={showConfirmation ? undefined : handleLogout}
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Cerrando sesión...
          </>
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </>
        )}
      </Button>
    );

    if (showConfirmation) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {LogoutButton}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro que quieres cerrar tu sesión? 
                {user?.name && ` Adiós, ${user.name}.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Cerrar sesión
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return LogoutButton;
  }

  return (
    <Button asChild size={size} className={className}>
      <a href="/api/auth/login">
        Login
      </a>
    </Button>
  );
}