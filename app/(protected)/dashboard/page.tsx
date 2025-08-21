'use client';

import { useUser } from '@/hooks/use-auth';
import { usePasswordResetCheck } from '@/hooks/use-password-reset-check';
import { ApiExample } from '@/components/examples/ApiExample';
import { ForceResetExample } from '@/components/examples/ForceResetExample';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading, error } = useUser();
  const {
    isLoading: resetCheckLoading,
    resetRequired,
    isProcessingReset,
    error: resetCheckError,
    retry: retryResetCheck,
  } = usePasswordResetCheck();

  // Show loading while checking user or password reset status
  if (isLoading || resetCheckLoading || isProcessingReset) {
    const loadingMessage = isProcessingReset 
      ? 'Redirigiendo al reset de password...' 
      : resetCheckLoading 
      ? 'Verificando políticas de seguridad...' 
      : 'Loading...';

    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Cargando Dashboard
              </h3>
              <p className="text-gray-600 text-sm">
                {loadingMessage}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show error if user fetch failed or password reset check failed
  if (error || resetCheckError) {
    const errorMessage = error?.message || resetCheckError || 'Unknown error occurred';
    const isResetError = !!resetCheckError && !error;

    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {isResetError ? 'Error en Verificación de Seguridad' : 'Error de Autenticación'}
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            </div>
            {isResetError && (
              <Button 
                onClick={retryResetCheck}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar Verificación
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              No Autenticado
            </h3>
            <p className="text-gray-600 text-sm">
              No tienes una sesión activa. Por favor inicia sesión.
            </p>
            <Button asChild className="w-full">
              <a href="/api/auth/login">Iniciar Sesión</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If password reset is required, the hook will automatically redirect
  // This code should not execute if reset is required, but we add a fallback
  if (resetRequired) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Reset de Password Requerido
              </h3>
              <p className="text-gray-600 text-sm">
                Redirigiendo a la página de cambio de password...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Normal dashboard content - only shown if no reset is required
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-xl text-gray-600">¡Bienvenido, {user.name}!</p>
        <p className="text-sm text-gray-500 mt-2">
          Gestiona tu cuenta y explora las funcionalidades disponibles
        </p>
      </div>
      
      <div className="grid gap-8">
        <ApiExample />
        <ForceResetExample />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">User Information:</h3>
        <pre className="text-xs bg-white p-3 rounded overflow-auto">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}