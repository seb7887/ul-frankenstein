'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-8">
      <div className="z-10 max-w-4xl w-full items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to UL Frankenstein
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A Next.js application with Auth0 Universal Login
          </p>
        </div>

        {isLoading ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Verificando estado de autenticación...</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {isAuthenticated && user ? (
              // Usuario autenticado
              <Card className="p-8 border-green-200 bg-green-50">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-4">
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt="Profile"
                        className="w-16 h-16 rounded-full border-4 border-green-200"
                      />
                    )}
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-green-800">
                        ¡Hola, {user.name}! 👋
                      </h2>
                      <p className="text-green-600">{user.email}</p>
                      <div className="flex items-center mt-2">
                        <Shield className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-600">Sesión activa y segura</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-700 mb-6">
                    Ya tienes una sesión iniciada. Puedes acceder a tu dashboard o explorar la aplicación.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      href="/dashboard"
                      className={cn(buttonVariants({ size: "lg" }), "flex items-center")}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Ir al Dashboard
                    </Link>
                  </div>
                </div>
              </Card>
            ) : (
              // Usuario no autenticado
              <Card className="p-8 border-blue-200 bg-blue-50">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-blue-800 mb-2">
                      Bienvenido
                    </h2>
                    <p className="text-blue-600">
                      Para acceder a todas las funciones, necesitas iniciar sesión
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/api/auth/login"
                      className={cn(buttonVariants({ size: "lg" }))}
                    >
                      Iniciar Sesión
                    </a>
                    
                    <Link 
                      href="/dashboard"
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                    >
                      Explorar Dashboard
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Información adicional */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">🔐 Seguridad</h3>
                <p className="text-gray-600 text-sm">
                  Utilizamos Auth0 con Universal Login para proporcionar la máxima seguridad 
                  y una experiencia de autenticación sin problemas.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">🚀 Características</h3>
                <p className="text-gray-600 text-sm">
                  Dashboard personalizado, gestión de sesiones, validación de tokens 
                  y mucho más con tecnología moderna.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}