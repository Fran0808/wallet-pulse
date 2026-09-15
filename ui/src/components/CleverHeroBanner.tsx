import React from 'react';
import {
  Calendar,
  CreditCard,
} from 'lucide-react';
import type { PeriodAnalytics } from '../types';
import { formatCurrency, formatDate, getChannelLabel } from '../utils/formatters';

interface CleverHeroBannerProps {
  analytics: PeriodAnalytics | null;
  loading: boolean;
  selectedYear: number;
  selectedMonth: number;
  onPeriodChange: (year: number, month: number) => void;
}

export const CleverHeroBanner: React.FC<CleverHeroBannerProps> = ({
  analytics,
  loading,
  selectedYear,
  selectedMonth,
  onPeriodChange,
}) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  if (!analytics) {
    return (
      <div className="rounded-3xl bg-blue-900/10 border border-blue-200/60 p-8 animate-pulse">
        <div className="h-4 w-32 bg-blue-200 rounded mb-4" />
        <div className="h-12 w-48 bg-blue-300 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-24 bg-blue-100 rounded-2xl" />
          <div className="h-24 bg-blue-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] text-white shadow-xl shadow-blue-950/15 p-6 sm:p-8 relative overflow-hidden transition-opacity duration-200 ${
        loading ? 'opacity-75' : 'opacity-100'
      }`}
    >
      {/* Decorative ambient glows */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        
        {/* Top bar: Period context & Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-blue-400/30 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase font-extrabold tracking-wider text-blue-200">
              Control de Cashflow
            </span>
            <span className="text-blue-300/60">·</span>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {analytics.periodName || 'Este Período'} {selectedYear}
            </span>
          </div>

          {/* Period Selector Controls */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-blue-950/40 border border-blue-400/30 backdrop-blur-xs text-xs font-semibold">
              <button
                type="button"
                onClick={() => onPeriodChange(currentYear, currentMonth)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isCurrentMonth
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Este mes
              </button>
              <button
                type="button"
                onClick={() => {
                  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                  onPeriodChange(prevYear, prevMonth);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  !isCurrentMonth
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Mes anterior
              </button>
            </div>
          </div>
        </div>

        {/* Hero Big Outflow */}
        <div>
          <span className="text-sm font-medium text-blue-100">
            Total gastado en {analytics.periodName?.toLowerCase() || 'el período'}
          </span>
          <div className="mt-1 flex items-baseline gap-3 flex-wrap">
            <h2 className="text-4xl sm:text-5xl font-black font-num tracking-tight text-white">
              {formatCurrency(analytics.monthlyExpense)}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-950/40 border border-sky-400/30 text-sky-200">
              Salidas verificadas
            </span>
          </div>
        </div>

        {/* 2 Sub-Cards: Balanced & Spacious Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* 1. Last detected payment */}
          <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-xs rounded-2xl p-5 border border-white/15 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-blue-100 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-300" />
                Último pago detectado
              </span>
              <span className="text-[11px] text-blue-200 font-mono">
                {analytics.lastExpenseDate ? formatDate(analytics.lastExpenseDate) : 'N/A'}
              </span>
            </div>
            <div className="mt-3">
              <p className="font-bold text-white text-lg truncate">
                {analytics.lastExpenseMerchant}
              </p>
              <p className="text-base font-bold font-num text-sky-200 mt-0.5">
                - {formatCurrency(analytics.lastExpenseAmount)}
              </p>
            </div>
          </div>

          {/* 2. Top Spending Channel */}
          <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-xs rounded-2xl p-5 border border-white/15 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-blue-100 font-medium">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-sky-300" />
                Mayor fuente de gasto
              </span>
              <span className="text-sm font-bold text-white font-num">
                {analytics.topChannelPercentage}%
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-lg">
                  {getChannelLabel(analytics.topChannel)}
                </p>
                <span className="text-sm font-num font-semibold text-sky-200">
                  {formatCurrency(analytics.topChannelAmount)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-blue-950/50 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-sky-300 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(10, analytics.topChannelPercentage))}%` }}
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
