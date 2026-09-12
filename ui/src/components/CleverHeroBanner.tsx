import React from 'react';
import {
  Calendar,
  CreditCard,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { PeriodAnalytics } from '../types';
import { formatCurrency, formatDate, getChannelLabel } from '../utils/formatters';

interface CleverHeroBannerProps {
  analytics: PeriodAnalytics | null;
  loading: boolean;
}

export const CleverHeroBanner: React.FC<CleverHeroBannerProps> = ({ analytics, loading }) => {
  if (loading || !analytics) {
    return (
      <div className="rounded-3xl bg-emerald-700/20 border border-emerald-500/20 p-8 animate-pulse text-white">
        <div className="h-4 w-32 bg-emerald-600/30 rounded mb-4" />
        <div className="h-12 w-48 bg-emerald-600/40 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-20 bg-emerald-600/20 rounded-2xl" />
          <div className="h-20 bg-emerald-600/20 rounded-2xl" />
          <div className="h-20 bg-emerald-600/20 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-[#087847] text-white shadow-xl shadow-emerald-950/10 p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        
        {/* Top bar: Period context */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-600/60 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              Control de Cashflow · {analytics.periodName || 'Este Período'}
            </span>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Dinero movido en consumo real (excluye transferencias entre cuentas propias)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/40 text-emerald-100 border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              <span>Tiempo real</span>
            </span>
          </div>
        </div>

        {/* Hero Big Outflow */}
        <div>
          <span className="text-sm font-semibold text-emerald-100">
            Total gastado este período
          </span>
          <div className="mt-1 flex items-baseline gap-3 flex-wrap">
            <h2 className="text-4xl sm:text-5xl font-black font-num tracking-tight text-white">
              {formatCurrency(analytics.monthlyExpense)}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-900/40 border border-emerald-400/30 text-emerald-200">
              Salidas verificadas
            </span>
          </div>
        </div>

        {/* 3 Sub-Cards: Clever Inspired Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* 1. Last detected payment */}
          <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-100 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                Último pago detectado
              </span>
              <span className="text-[10px] text-emerald-200">
                {analytics.lastExpenseDate ? formatDate(analytics.lastExpenseDate) : 'N/A'}
              </span>
            </div>
            <div className="mt-3">
              <p className="font-bold text-white text-base truncate">
                {analytics.lastExpenseMerchant}
              </p>
              <p className="text-sm font-bold font-num text-emerald-200 mt-0.5">
                - {formatCurrency(analytics.lastExpenseAmount)}
              </p>
            </div>
          </div>

          {/* 2. Top Spending Channel */}
          <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-100 font-medium">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
                Mayor fuente de gasto
              </span>
              <span className="text-xs font-bold text-white font-num">
                {analytics.topChannelPercentage}%
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-base">
                  {getChannelLabel(analytics.topChannel)}
                </p>
                <span className="text-xs font-num font-semibold text-emerald-200">
                  {formatCurrency(analytics.topChannelAmount)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-emerald-950/40 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-300 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(10, analytics.topChannelPercentage))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Internal Transfers Excluded (Honesty Indicator) */}
          <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-100 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Transferencias propias
              </span>
              <span className="text-[10px] text-emerald-200 bg-emerald-900/40 px-2 py-0.5 rounded-full">
                Excluidas
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                <strong className="text-white font-num text-sm">{formatCurrency(analytics.internalTransfersAmount)}</strong> traspasados entre tus cuentas sin inflar gastos.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
