import React from 'react';
import { TrendingUp, TrendingDown, Scale, ReceiptText } from 'lucide-react';
import type { FinancialSummary } from '../types';
import { formatCurrency } from '../utils/formatters';

interface FinancialSummaryCardsProps {
  summary: FinancialSummary | null;
  loading: boolean;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-[#111827] border border-slate-800 animate-pulse"
          >
            <div className="h-4 w-24 bg-slate-800 rounded mb-3" />
            <div className="h-8 w-36 bg-slate-700 rounded mb-2" />
            <div className="h-3 w-28 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const isNetPositive = summary.netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Balance */}
      <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Balance Neto
          </span>
          <div
            className={`p-2 rounded-lg border ${
              isNetPositive
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            <Scale className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4">
          <p
            className={`text-2xl lg:text-3xl font-bold font-num tracking-tight ${
              isNetPositive ? 'text-[#00d09c]' : 'text-[#f43f5e]'
            }`}
          >
            {formatCurrency(summary.netBalance)}
          </p>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>Ingresos acumulados vs Gastos</span>
          </p>
        </div>
      </div>

      {/* 2. Total Expenses */}
      <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Total Gastos
          </span>
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-2xl lg:text-3xl font-bold font-num tracking-tight text-white">
            {formatCurrency(summary.totalExpense)}
          </p>
          <p className="text-xs text-rose-400/90 mt-1 flex items-center gap-1">
            <span>Salidas bancarias & consumos</span>
          </p>
        </div>
      </div>

      {/* 3. Total Income */}
      <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Total Ingresos
          </span>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-2xl lg:text-3xl font-bold font-num tracking-tight text-white">
            {formatCurrency(summary.totalIncome)}
          </p>
          <p className="text-xs text-emerald-400/90 mt-1 flex items-center gap-1">
            <span>Abonos & transferencias</span>
          </p>
        </div>
      </div>

      {/* 4. Transactions Count */}
      <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Transacciones
          </span>
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <ReceiptText className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-2xl lg:text-3xl font-bold font-num tracking-tight text-white">
            {summary.totalTransactions}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Registradas e indexadas
          </p>
        </div>
      </div>
    </div>
  );
};
