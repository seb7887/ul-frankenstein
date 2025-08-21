'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Home } from 'lucide-react';

export default function PasswordResetSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Start countdown and auto-logout
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Logout and redirect to password-reset-complete page
      window.location.href = '/api/auth/logout?returnTo=' + encodeURIComponent(window.location.origin + '/password-reset-complete');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect to home
      router.push('/');
    }
  };

  const handleManualLogout = () => {
    handleLogout();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Cerrando Sesión
            </h1>
            <p className="text-gray-600">
              Por favor espera mientras cerramos tu sesión de forma segura...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Password Actualizado!
            </h1>
            <p className="text-gray-600">
              Tu password ha sido actualizado exitosamente.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-blue-800">
                Por seguridad, cerraremos tu sesión
              </p>
              <p className="text-sm text-blue-700">
                Cierre automático en <span className="font-bold">{countdown}</span> segundos
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleManualLogout}
              className="w-full"
            >
              Cerrar Sesión Ahora
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGoHome}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir al Inicio
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              Una vez cerrada la sesión, podrás iniciar sesión nuevamente con tu nuevo password.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}