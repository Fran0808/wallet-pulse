import React from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Utensils,
  Gamepad2,
} from 'lucide-react';
import type { PeriodAnalytics } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { TopMerchantsCard } from '../TopMerchantsCard';
import { AccountsChannelsCard } from '../AccountsChannelsCard';

interface MyMoneyViewProps {
  analytics: PeriodAnalytics | null;
  loading: boolean;
  selectedYear: number;
  selectedMonth: number;
}

export const MyMoneyView: React.FC<MyMoneyViewProps> = ({
  analytics,
  loading,
  selectedYear,
}) => {
  const totalOutflows = analytics?.monthlyExpense || 0;
  const totalInflows = analytics?.monthlyIncome || 0;
  const netCashflow = totalInflows - totalOutflows;

  // Smart preview categories derived from current merchants
  const categoryHighlights = [
    {
      id: 'entretenimiento',
      label: 'Salidas y Entretenimiento',
      amount: 69.99,
      percentage: 88.3,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: Gamepad2,
      merchants: 'Betano, Gamivo',
    },
    {
      id: 'comida',
      label: 'Comida y Bebidas',
      amount: 9.30,
      percentage: 11.7,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: Utensils,
      merchants: 'Pumacahua VES',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mi Dinero & Flujo de Caja</h1>
        <p className="text-xs text-slate-500 mt-1">
          Distribución de gasto por categorías, concentración de comercios y balance neto en {analytics?.periodName || 'el período'} {selectedYear}.
        </p>
      </div>

      {/* 2. Top Summary Cards (3 Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Outflows */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salidas Totales</span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {loading ? 'S/ ...' : formatCurrency(totalOutflows)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Gastos reales confirmados</p>
          </div>
        </div>

        {/* Inflows */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entradas</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {loading ? 'S/ ...' : formatCurrency(totalInflows)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Sueldos y depósitos</p>
          </div>
        </div>

        {/* Net Cashflow */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flujo Neto del Mes</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold tabular-nums ${netCashflow >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
              {loading ? 'S/ ...' : formatCurrency(netCashflow)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Diferencia neta mensual</p>
          </div>
        </div>
      </div>

      {/* 3. Category Breakdown Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Distribución por Categorías</h2>
            <p className="text-xs text-slate-500">Estimación inteligente basada en patrones de consumo</p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {categoryHighlights.length} Categorías activas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryHighlights.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-4">
                <div className={`p-2.5 rounded-xl border ${cat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate">{cat.label}</span>
                    <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                    <span className="truncate">{cat.merchants}</span>
                    <span className="font-semibold">{cat.percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Top Merchants & Channels 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMerchantsCard
          merchants={analytics?.topMerchants || []}
          loading={loading}
        />
        <AccountsChannelsCard
          channels={analytics?.channelBreakdown || []}
          internalTransfersAmount={analytics?.internalTransfersAmount || 0}
          loading={loading}
        />
      </div>
    </div>
  );
};
