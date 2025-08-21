'use client';

import { useState } from 'react';
import { PasswordResetFlow } from '@/components/auth/PasswordResetFlow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';

export function ForceResetExample() {
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSuccess = (resetUrl: string) => {
    console.log('Reset URL generated:', resetUrl);
    setResetSuccess(true);
  };

  const handleError = (error: string) => {
    console.error('Reset error:', error);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-600" />
          Forced Password Reset System
        </h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Cómo funciona:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Middleware verifica custom claim <code>{'https://domain.auth0.com/prp'}</code></li>
              <li>• Si <code>prp === true</code>, redirige automáticamente</li>
              <li>• Se crea ticket de reset via Management API</li>
              <li>• Usuario completa reset en Auth0</li>
              <li>• Logout automático post-reset</li>
            </ul>
          </div>

          {!showResetFlow ? (
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Simular Force Reset
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Este ejemplo simula el flujo que se activaría automáticamente 
                      cuando el claim <code>prp</code> sea <code>true</code>.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowResetFlow(true)}
                className="w-full"
              >
                Simular Forced Password Reset
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {resetSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium text-green-800">
                      Ticket de reset generado exitosamente
                    </p>
                  </div>
                </div>
              )}
              
              <PasswordResetFlow
                autoStart={true}
                onSuccess={handleSuccess}
                onError={handleError}
              />
              
              <Button 
                variant="outline"
                onClick={() => {
                  setShowResetFlow(false);
                  setResetSuccess(false);
                }}
                className="w-full"
              >
                Resetear Demo
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Setup Requerido en Auth0:</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">1. Machine-to-Machine Application</h4>
            <ul className="text-gray-600 space-y-1 ml-4">
              <li>• Crear M2M app para Management API</li>
              <li>• Scopes: <code>read:users</code>, <code>update:users</code>, <code>create:user_tickets</code></li>
              <li>• Configurar CLIENT_ID y SECRET en env</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">2. Custom Claims (Rules/Actions)</h4>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono">
              <pre>{`function addCustomClaims(user, context, callback) {
  const namespace = 'https://your-domain.auth0.com/';
  const token = context.accessToken || context.idToken;
  
  // Set password reset required based on your logic
  token[namespace + 'prp'] = shouldForceReset(user);
  
  callback(null, user, context);
}`}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">3. Callbacks URLs</h4>
            <ul className="text-gray-600 space-y-1 ml-4">
              <li>• Login: <code>http://localhost:3000/api/auth/callback</code></li>
              <li>• Logout: <code>http://localhost:3000/password-reset-complete</code></li>
              <li>• Reset Success: <code>http://localhost:3000/password-reset-success</code></li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}