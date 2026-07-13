/**
 * @file App.tsx
 * @description Punto de entrada principal de la aplicación STARE Piura.
 *
 * ─── CHECKPOINT FASE 3/9 ───
 * Integra la Landing Page comercial y la pantalla de Login con autenticación real
 * o simulación Mock.
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ToastProvider } from '@/components/ui';
import { AppRouter } from '@/app/router/AppRouter';
import { Login } from '@/pages/Login';
import { Landing } from '@/pages/Landing';
import { useAuthStore } from '@/stores/auth';

export default function App() {
  const { user, initialized, initializeAuth } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);

  // Inicializar sesión de autenticación al arrancar la app
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Pantalla de carga mientras se recupera la sesión (Supabase / LocalStorage)
  if (!initialized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-teal-400 mb-4" />
        <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
          Inicializando STARE...
        </p>
      </div>
    );
  }

  // Si está autenticado, cargar el enrutador de la aplicación
  if (user) {
    return (
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    );
  }

  // Si no hay sesión activa, decidir si mostrar la Landing o el Login
  if (showLogin) {
    return <Login onBack={() => setShowLogin(false)} />;
  }

  return <Landing onEnter={() => setShowLogin(true)} />;
}
