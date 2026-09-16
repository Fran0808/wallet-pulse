import React from 'react';
import {
  CreditCard,
  Smartphone,
  ChevronRight,
  Clock,
  TrendingDown,
  ShoppingBag,
} from 'lucide-react';
import type { PeriodAnalytics, Transaction, ChannelBreakdown } from '../../types';
import { formatCurrency, formatRelativeDate } from '../../utils/formatters';

interface HomeViewProps {
  analytics: PeriodAnalytics | null;
  recentTransactions: Transaction[];
  loading: boolean;
  onNavigateToTransactions: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  selectedYear: number;
  selectedMonth: number;
  onPeriodChange: (year: number, month: number) => void;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const HomeView: React.FC<HomeViewProps> = ({
  analytics,
  recentTransactions,
  loading,
  onNavigateToTransactions,
  onSelectTransaction,
  selectedYear,
  selectedMonth,
  onPeriodChange,
}) => {
  const totalOutflows = analytics?.monthlyExpense || 0;
  const topMerchant = analytics?.topMerchants?.[0];
  const expenseTransactions = recentTransactions.filter((tx) => tx.flowType === 'EXPENSE');

  const getFriendlyChannelName = (item: ChannelBreakdown) => {
    if (item.cardLast4 && item.cardLast4.trim().length > 0) {
      if (item.channel.includes('CREDITO')) return `BCP Crédito ··${item.cardLast4}`;
      if (item.channel.includes('DEBITO')) return `BCP Débito ··${item.cardLast4}`;
      return `BCP ··${item.cardLast4}`;
    }
    if (item.displayName && !item.displayName.includes('_') && !item.displayName.includes('null')) {
      return item.displayName.replace(/\*\*/g, '··');
    }
    if (item.channel === 'YAPE' || item.channel.includes('YAPE')) return 'Yape';
    if (item.channel.includes('CREDITO')) return 'BCP Crédito';
    if (item.channel.includes('DEBITO')) return 'BCP Débito';
    return item.channel.replace(/_/g, ' ');
  };

  const getTxFriendlyChannel = (tx: Transaction) => {
    if (tx.cardLast4 && tx.cardLast4.trim().length > 0) {
      if (tx.channel.includes('CREDITO')) return `BCP Crédito ··${tx.cardLast4}`;
      if (tx.channel.includes('DEBITO')) return `BCP Débito ··${tx.cardLast4}`;
      return `BCP ··${tx.cardLast4}`;
    }
    if (tx.channel === 'YAPE' || tx.channel.includes('YAPE')) return 'Yape';
    if (tx.channel.includes('CREDITO')) return 'BCP Crédito';
    if (tx.channel.includes('DEBITO')) return 'BCP Débito';
    return tx.channel.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Period Selector & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pulso Financiero</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              En vivo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoreo en tiempo real de salidas, velocidad de gasto y canales digitales.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm">
          <select
            value={selectedMonth}
            onChange={(e) => onPeriodChange(selectedYear, Number(e.target.value))}
            className="text-xs font-semibold text-slate-700 bg-transparent border-0 focus:ring-0 cursor-pointer"
          >
            {MONTHS.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
          <span className="text-slate-300">/</span>
          <select
            value={selectedYear}
            onChange={(e) => onPeriodChange(Number(e.target.value), selectedMonth)}
            className="text-xs font-semibold text-slate-700 bg-transparent border-0 focus:ring-0 cursor-pointer"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      {/* 2. Redesigned Clear & Flat Hero Banner (Sin sombras y tono más claro) */}
      <div className="relative rounded-3xl bg-slate-800/95 p-6 sm:p-7 text-white border border-slate-700/70">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Primary Metric: Month Expense */}
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-bold tracking-wider uppercase">
              <TrendingDown className="h-4 w-4 text-rose-400" />
              <span>Gastos de {MONTHS[selectedMonth - 1]} {selectedYear}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums text-white">
                {loading ? 'S/ ...' : formatCurrency(totalOutflows)}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-300">
              Total acumulado en compras y consumos confirmados en tus cuentas.
            </p>
          </div>

          {/* Clean Sub-Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t lg:border-t-0 lg:border-l border-slate-700/80 pt-4 lg:pt-0 lg:pl-6">
            {/* Top Merchant / Concentration */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 min-w-[200px]">
              <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />
                <span>Mayor Consumo</span>
              </div>
              <p className="mt-1 text-base font-bold text-white tabular-nums truncate max-w-[190px]">
                {loading
                  ? '...'
                  : topMerchant
                  ? formatCurrency(topMerchant.totalAmount)
                  : 'S/ 0.00'}
              </p>
              <span className="text-[11px] text-amber-300 mt-0.5 block truncate max-w-[190px] font-medium">
                {topMerchant
                  ? `${topMerchant.merchantName} (${topMerchant.percentage}% del total)`
                  : 'Sin consumos'}
              </span>
            </div>

            {/* Last Expense */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 min-w-[190px]">
              <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                <Clock className="h-3.5 w-3.5 text-blue-300" />
                <span>Último Gasto</span>
              </div>
              <p className="mt-1 text-base font-bold text-white tabular-nums truncate max-w-[180px]">
                {loading
                  ? '...'
                  : analytics?.lastExpenseAmount
                  ? formatCurrency(analytics.lastExpenseAmount)
                  : 'S/ 0.00'}
              </p>
              <span className="text-[11px] text-slate-300 mt-0.5 block truncate max-w-[180px]">
                {analytics?.lastExpenseMerchant || 'Sin gastos registrados'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Activity Feed & Top Spenders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Actividad Reciente</h2>
                <p className="text-xs text-slate-500">Últimos consumos indexados por el motor</p>
              </div>
              <button
                type="button"
                onClick={onNavigateToTransactions}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors"
              >
                <span>Ver historial completo</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Cargando movimientos recientes...
              </div>
            ) : expenseTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No hay consumos registrados en este período.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {expenseTransactions.slice(0, 5).map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => onSelectTransaction(tx)}
                    className="w-full py-3 flex items-center justify-between text-left hover:bg-slate-50/90 px-2.5 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 flex items-center justify-center font-bold text-xs border border-slate-200/80 group-hover:border-blue-200 transition-colors">
                        {tx.contactName ? tx.contactName.substring(0, 2).toUpperCase() : 'TX'}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {tx.contactName || 'Comercio'}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{getTxFriendlyChannel(tx)}</span>
                          <span>•</span>
                          <span>{formatRelativeDate(tx.transactionDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold tabular-nums text-slate-900">
                        {formatCurrency(tx.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Gasto
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Distribution & Channels Overview */}
        <div className="space-y-6">
          {/* Channels Breakdown Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Medios de Pago</h2>
            <p className="text-xs text-slate-500 mb-4">Concentración por billetera o tarjeta</p>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                Calculando canales...
              </div>
            ) : !analytics?.channelBreakdown?.length ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Sin datos de canales
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.channelBreakdown.map((item, index) => {
                  const isYape = item.channel.includes('YAPE') || item.channel.includes('PLIN');
                  const isCredito = item.channel.includes('CREDITO');
                  const friendlyName = getFriendlyChannelName(item);

                  // Authentic Peruvian financial brand colors:
                  // Yape: Purple #742284 / fuchsia
                  // BCP Crédito: Deep Royal Blue #002A8F
                  // BCP Débito: Sky / Cyan #0077C8
                  const iconColor = isYape ? 'text-purple-600' : isCredito ? 'text-blue-700' : 'text-sky-600';
                  const barGradient = isYape
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-500'
                    : isCredito
                    ? 'bg-gradient-to-r from-blue-700 to-indigo-600'
                    : 'bg-gradient-to-r from-sky-500 to-blue-500';

                  return (
                    <div
                      key={`${item.channel}-${item.cardLast4 || index}`}
                      className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-800 flex items-center gap-2">
                          {isYape ? (
                            <Smartphone className={`h-4 w-4 ${iconColor}`} />
                          ) : (
                            <CreditCard className={`h-4 w-4 ${iconColor}`} />
                          )}
                          <span className="truncate max-w-[160px]">{friendlyName}</span>
                        </span>
                        <span className="font-bold tabular-nums text-slate-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      {/* Progress Bar with authentic brand colors */}
                      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barGradient}`}
                          style={{ width: `${Math.min(100, Math.max(5, item.percentage))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                        <span>{item.count} {item.count === 1 ? 'movimiento' : 'movimientos'}</span>
                        <span className="font-medium text-slate-600">{item.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
