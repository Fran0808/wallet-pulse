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
    <header className="border-b border-slate-800 bg-[#0c121d]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand and Live Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d09c] opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00d09c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">WalletPulse</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  BCP Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitoreo continuo de correos bancarios y billeteras
              </p>
            </div>
          </div>

          {/* Action Bar / Status Pill */}
          <div className="flex items-center gap-3">
            {syncResult && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <MailCheck className="w-3.5 h-3.5 text-[#00d09c]" />
                <span>
                  Última sincronización: <strong className="text-white">{syncResult.savedCount}</strong> nuevas de {syncResult.scannedCount} correos
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00d09c] focus:ring-offset-2 focus:ring-offset-[#0a0e17] ${
                isSyncing
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-[#00d09c] text-slate-950 hover:bg-[#00ba8b] active:scale-[0.98]'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-slate-400' : 'text-slate-950'}`} />
              <span>{isSyncing ? 'Descargando correos...' : 'Sincronizar Correos'}</span>
            </button>
          </div>
        </div>

        {/* Transient Error Alert if any */}
        {error && (
          <div role="alert" className="mt-3 flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </header>
  );
};
