'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ResetResponse {
  reset_url: string;
  expires_at: string;
  user_id: string;
}

export default function PasswordResetRequiredPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  useEffect(() => {
    initiatePasswordReset();
  }, []);

  const initiatePasswordReset = async () => {
    try {
      setLoading(true);
      setError(null);

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

      const data: ResetResponse = await response.json();
      setResetUrl(data.reset_url);
      
      // Auto-redirect to Auth0 reset page after a short delay
      setTimeout(() => {
        window.location.href = data.reset_url;
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Password reset initiation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    initiatePasswordReset();
  };

  const handleManualRedirect = () => {
    if (resetUrl) {
      window.location.href = resetUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Configurando Reset de Password
            </h1>
            <p className="text-gray-600">
              Por favor espera mientras preparamos tu reset de password...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Error en Reset de Password
            </h1>
            <p className="text-red-600 text-sm">
              {error}
            </p>
            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full">
                Reintentar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/api/auth/logout')}
                className="w-full"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Redirigiendo a Reset de Password
          </h1>
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-800">
                    Reset de Password Requerido
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Por políticas de seguridad, necesitas actualizar tu password antes de continuar.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm">
              Te estamos redirigiendo automáticamente a la página de reset de password...
            </p>
            
            <Button 
              onClick={handleManualRedirect}
              className="w-full"
              disabled={!resetUrl}
            >
              Ir Ahora al Reset
            </Button>
            
            <p className="text-xs text-gray-500">
              Una vez que actualices tu password, serás redirigido de vuelta a la aplicación.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}