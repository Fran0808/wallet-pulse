import React from 'react';
import { RefreshCw, MailCheck, AlertCircle } from 'lucide-react';
import type { EmailSyncResponse } from '../types';

interface HeaderPulseProps {
  isSyncing: boolean;
  onSync: () => void;
  syncResult: EmailSyncResponse | null;
  error: string | null;
}

export const HeaderPulse: React.FC<HeaderPulseProps> = ({
  isSyncing,
  onSync,
  syncResult,
  error,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand and Live Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  Wallet<span className="text-indigo-600">Pulse</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  BCP Ingestion Live
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Monitoreo continuo de correos bancarios y billeteras
              </p>
            </div>
          </div>

          {/* Action Bar / Status Pill */}
          <div className="flex items-center gap-3">
            {syncResult && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
                <MailCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Última sincronización: <strong className="text-slate-900 font-bold">{syncResult.savedCount}</strong> nuevas de {syncResult.scannedCount} correos
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isSyncing
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-500/20 hover:shadow-indigo-500/30'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-slate-400' : 'text-white'}`} />
              <span>{isSyncing ? 'Descargando correos...' : 'Sincronizar Correos'}</span>
            </button>
          </div>
        </div>

        {/* Transient Error Alert if any */}
        {error && (
          <div role="alert" className="mt-3 flex items-center gap-2 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 px-3 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </header>
  );
};
