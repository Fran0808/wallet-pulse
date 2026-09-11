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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs animate-pulse"
          >
            <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
            <div className="h-8 w-36 bg-slate-300 rounded mb-2" />
            <div className="h-3 w-28 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const isNetPositive = summary.netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Net Balance */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
            Balance Neto
          </span>
          <div
            className={`p-2.5 rounded-xl border ${
              isNetPositive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}
          >
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-5">
          <p
            className={`text-3xl font-extrabold font-num tracking-tight ${
              isNetPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(summary.netBalance)}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Ingresos acumulados vs Gastos
          </p>
        </div>
      </div>

      {/* 2. Total Expenses */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
            Total Gastos
          </span>
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-3xl font-extrabold font-num tracking-tight text-slate-900">
            {formatCurrency(summary.totalExpense)}
          </p>
          <p className="text-xs text-rose-600 font-medium mt-1">
            Salidas bancarias & consumos
          </p>
        </div>
      </div>

      {/* 3. Total Income */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
            Total Ingresos
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-3xl font-extrabold font-num tracking-tight text-slate-900">
            {formatCurrency(summary.totalIncome)}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            Abonos & transferencias
          </p>
        </div>
      </div>

      {/* 4. Transactions Count */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
            Transacciones
          </span>
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
            <ReceiptText className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-3xl font-extrabold font-num tracking-tight text-slate-900">
            {summary.totalTransactions}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Registradas e indexadas
          </p>
        </div>
      </div>
    </div>
  );
};
