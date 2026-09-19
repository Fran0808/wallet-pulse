import React from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Utensils,
  Gamepad2,
} from 'lucide-react';
import type { PeriodAnalytics } from '../../types';
import { formatCurrency } from '../../utils';
import { TopMerchantsCard, AccountsChannelsCard } from '../dashboard';
import { CategoryDonutChart, ChannelsMultiRingChart } from '../charts';
import type { CategoryItem } from '../charts';

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

  const categoryHighlights: CategoryItem[] = [
    {
      id: 'entretenimiento',
      label: 'Salidas y Entretenimiento',
      amount: 69.99,
      percentage: 88.3,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      strokeColor: '#9333ea', // Purple-600
      icon: Gamepad2,
      merchants: 'Betano, Gamivo',
    },
    {
      id: 'comida',
      label: 'Comida y Bebidas',
      amount: 9.30,
      percentage: 11.7,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      strokeColor: '#f59e0b', // Amber-500
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
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
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
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
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
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flujo Neto del Mes</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDonutChart
          categories={categoryHighlights}
          totalAmount={totalOutflows}
          loading={loading}
        />

        <ChannelsMultiRingChart
          channels={analytics?.channelBreakdown || []}
          totalExpense={totalOutflows}
          internalTransfersAmount={analytics?.internalTransfersAmount || 0}
          loading={loading}
        />
      </div>

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
