'use client';

import { useEffect } from 'react';
import { useForceReset } from '@/hooks/use-force-reset';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface PasswordResetFlowProps {
  autoStart?: boolean;
  onSuccess?: (resetUrl: string) => void;
  onError?: (error: string) => void;
}

export function PasswordResetFlow({ 
  autoStart = true, 
  onSuccess, 
  onError 
}: PasswordResetFlowProps) {
  const {
    loading,
    error,
    resetUrl,
    expiresAt,
    initiateReset,
    redirectToReset,
    clearError,
    canRedirect,
  } = useForceReset();

  useEffect(() => {
    if (autoStart) {
      initiateReset();
    }
  }, [autoStart, initiateReset]);

  useEffect(() => {
    if (resetUrl && onSuccess) {
      onSuccess(resetUrl);
    }
  }, [resetUrl, onSuccess]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Preparando Reset de Password
          </h3>
          <p className="text-gray-600 text-sm">
            Configurando tu reset de password de forma segura...
          </p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Error en Reset de Password
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={() => {
                clearError();
                initiateReset();
              }}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (canRedirect) {
    const expirationTime = expiresAt ? new Date(expiresAt).toLocaleString() : 'No especificado';
    
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Reset de Password Listo
          </h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-800">
                  Reset de Password Requerido
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Por políticas de seguridad, necesitas actualizar tu password.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={redirectToReset}
              className="w-full"
              size="lg"
            >
              Continuar al Reset de Password
            </Button>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>El enlace expira el: {expirationTime}</p>
              <p>Serás redirigido a Auth0 para completar el proceso de forma segura.</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Reset de Password
        </h3>
        <p className="text-gray-600 text-sm">
          Haz clic en el botón para iniciar el proceso de reset de password.
        </p>
        <Button 
          onClick={initiateReset}
          className="w-full"
        >
          Iniciar Reset de Password
        </Button>
      </div>
    </Card>
  );
}