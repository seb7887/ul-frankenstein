'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, LogIn, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PasswordResetCompletePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/api/auth/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Completado!
            </h1>
            <h2 className="text-xl text-gray-700">
              Password Actualizado Exitosamente
            </h2>
            <p className="text-gray-600">
              Tu password ha sido actualizado y tu sesión ha sido cerrada por seguridad.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-green-800">
                ✓ Password actualizado
              </p>
              <p className="text-sm font-medium text-green-800">
                ✓ Sesión cerrada de forma segura
              </p>
              <p className="text-sm text-green-700">
                Ya puedes iniciar sesión con tu nuevo password
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleLogin}
              className="w-full"
              size="lg"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión
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
              Si tienes problemas para iniciar sesión con tu nuevo password,
              contacta al soporte técnico.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}