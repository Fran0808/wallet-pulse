import React from 'react';
import { CreditCard, Smartphone, ShieldCheck, PieChart } from 'lucide-react';
import type { ChannelBreakdown } from '../types';
import { formatCurrency, getChannelLabel } from '../utils/formatters';

interface AccountsChannelsCardProps {
  channels: ChannelBreakdown[];
  internalTransfersAmount: number;
  loading: boolean;
}

export const AccountsChannelsCard: React.FC<AccountsChannelsCardProps> = ({
  channels,
  internalTransfersAmount,
  loading,
}) => {
  const getChannelIcon = (channel: string) => {
    if (channel.includes('YAPE') || channel.includes('PLIN')) {
      return <Smartphone className="w-4 h-4 text-purple-600" />;
    }
    if (channel.includes('CREDITO')) {
      return <CreditCard className="w-4 h-4 text-blue-700" />;
    }
    return <CreditCard className="w-4 h-4 text-sky-600" />;
  };

  const getChannelBarGradient = (channel: string) => {
    if (channel.includes('YAPE') || channel.includes('PLIN')) {
      return 'bg-gradient-to-r from-purple-600 to-fuchsia-500';
    }
    if (channel.includes('CREDITO')) {
      return 'bg-gradient-to-r from-blue-700 to-indigo-600';
    }
    return 'bg-gradient-to-r from-sky-500 to-blue-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <PieChart className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cuentas y tarjetas</h3>
              <p className="text-[11px] text-slate-500 font-medium">Movimiento del período por medio de pago</p>
            </div>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className={`mt-3 divide-y divide-slate-100 transition-opacity duration-200 ${loading ? 'opacity-70' : 'opacity-100'}`}>
          {loading && (!channels || channels.length === 0) ? (
            [...Array(2)].map((_, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between animate-pulse">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
            ))
          ) : !channels || channels.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Sin movimientos registrados en este período.
            </div>
          ) : (
            channels.map((c, idx) => (
              <div key={idx} className="py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100">
                      {getChannelIcon(c.channel)}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {c.displayName || getChannelLabel(c.channel)}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold font-num text-slate-900">
                    {formatCurrency(c.amount)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${getChannelBarGradient(c.channel)}`}
                    style={{ width: `${Math.min(100, Math.max(5, c.percentage))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>{c.count} operaciones</span>
                  <span>{c.percentage}% del gasto</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Internal Transfers Excluded Footer */}
      {internalTransfersAmount > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-semibold text-slate-700">Traspasos entre cuentas</span>
          </div>
          <span className="text-xs font-extrabold font-num text-slate-800">
            {formatCurrency(internalTransfersAmount)}
          </span>
        </div>
      )}
    </div>
  );
};
