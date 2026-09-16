import React from 'react';
import { Download } from 'lucide-react';
import type { PageResponse, Transaction } from '../../types';
import type { TransactionFilterParams } from '../../services/api';
import { TransactionTable } from '../TransactionTable';
import { TransactionFilters } from '../TransactionFilters';

interface TransactionsViewProps {
  pageData: PageResponse<Transaction> | null;
  loading: boolean;
  filters: TransactionFilterParams;
  onFilterChange: (filters: Partial<TransactionFilterParams>) => void;
  onPageChange: (newPage: number) => void;
  onSelectTransaction: (tx: Transaction) => void;
  periodName?: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  pageData,
  loading,
  filters,
  onFilterChange,
  onPageChange,
  onSelectTransaction,
  periodName,
}) => {
  const exportToCSV = () => {
    if (!pageData || !pageData.content.length) return;
    const headers = ['ID', 'Fecha', 'Comercio', 'Monto', 'Tipo', 'Canal', 'Tarjeta', 'Hash'];
    const rows = pageData.content.map((tx) => [
      tx.id,
      tx.transactionDate,
      `"${tx.contactName?.replace(/"/g, '""') || ''}"`,
      tx.amount,
      tx.flowType,
      tx.channel,
      tx.cardLast4 || '',
      tx.transactionHash,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `walletpulse_movimientos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Movimientos Confirmados</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro detallado de transacciones extraídas de correos bancarios y notificaciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-[0.98]"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Filters Component */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <TransactionFilters
          search={filters.search || ''}
          flowType={filters.flowType || ''}
          onSearchChange={(search) => onFilterChange({ search })}
          onFlowTypeChange={(flowType) => onFilterChange({ flowType })}
          onReset={() => onFilterChange({ search: '', flowType: '' })}
        />
      </div>

      {/* 3. Paginated Interactive Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
        <TransactionTable
          pageData={pageData}
          loading={loading}
          periodName={periodName}
          onPageChange={onPageChange}
          onSelectTransaction={onSelectTransaction}
        />
      </div>
    </div>
  );
};
