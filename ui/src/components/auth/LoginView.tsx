import React, { useState } from 'react';
import { useAuth } from '../../contexts';
import { Zap, ShieldCheck, ArrowRight, Loader2, Sparkles, Receipt, BellRing } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, error } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    try {
      setSubmitting(true);
      await loginWithGoogle();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500/20 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-xl tracking-tight text-white">Wallet<span className="text-blue-400">Pulse</span></span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Cashflow Console</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Multi-Tenant v1.0</span>
        </div>
      </header>

      {/* Hero & Authentication Card */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12 my-auto">
        {/* Left Value Proposition */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gestión financiera inteligente & automatizada</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Tu flujo de dinero <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              en tiempo real.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Captura y clasifica automáticamente tus gastos desde notificaciones de Yape y correos bancarios del BCP. Sin compartir contraseñas bancarias ni saldos globales.
          </p>

          {/* Value Points */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2 max-w-lg mx-auto lg:mx-0 text-left">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <Receipt className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Ingesta Automática</h4>
                <p className="text-xs text-slate-400 mt-0.5">Sincroniza recibos bancarios de correo en segundos.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Datos Aislados</h4>
                <p className="text-xs text-slate-400 mt-0.5">Tus finanzas son privadas y exclusivas de tu cuenta.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="w-full max-w-md shrink-0">
          <div className="relative rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 sm:p-10 shadow-2xl shadow-blue-500/5">
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-2xl font-bold text-white tracking-tight">Comenzar ahora</h3>
              <p className="text-sm text-slate-400">
                Inicia sesión con tu cuenta de Google para acceder a tu panel financiero personalizado.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2">
                <BellRing className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                  <span className="text-sm">Conectando con Google...</span>
                </>
              ) : (
                <>
                  {/* Official Google Icon SVG */}
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-sm">Continuar con Google</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Al continuar, autorizas la sincronización segura con lectura de notificaciones bancarias. Cada usuario cuenta con un entorno estrictamente aislado.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 text-center text-xs text-slate-400 border-t border-slate-900">
        WalletPulse &copy; {new Date().getFullYear()} &bull; Cashflow Over Balance &bull; Hecho con privacidad por diseño
      </footer>
    </div>
  );
};
