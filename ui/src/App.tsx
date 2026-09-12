import { useState } from 'react';
import { HeaderPulse } from './components/HeaderPulse';
import { FinancialSummaryCards } from './components/FinancialSummaryCards';
import { TransactionTable } from './components/TransactionTable';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { useFinance } from './hooks/useFinance';
import type { Transaction } from './types';

export function App() {
  const {
    summary,
    transactionsPage,
    loadingSummary,
    loadingTransactions,
    isSyncing,
    syncResult,
    error,
    filters,
    handlePageChange,
    handleFilterChange,
    triggerEmailSync,
  } = useFinance();

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20">
      {/* 1. Header Pulse */}
      <HeaderPulse
        isSyncing={isSyncing}
        onSync={triggerEmailSync}
        syncResult={syncResult}
        error={error}
      />

      {/* 2. Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Section: Financial Summary */}
        <section aria-labelledby="summary-heading">
          <div className="mb-4">
            <h2 id="summary-heading" className="text-lg font-bold text-slate-900">
              Resumen Financiero Consolidado
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Cálculo en vivo de ingresos y egresos capturados automáticamente
            </p>
          </div>
          <FinancialSummaryCards summary={summary} loading={loadingSummary} />
        </section>

        {/* Section: Transactions Ledger with Dynamic Filters */}
        <section aria-labelledby="transactions-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 id="transactions-heading" className="text-lg font-bold text-slate-900">
                Movimientos Recientes
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Filtra por tipo de flujo o busca compras por comercio
              </p>
            </div>
          </div>

          {/* Dynamic Filters */}
          <TransactionFilters
            search={filters.search || ''}
            flowType={filters.flowType || ''}
            onSearchChange={(search) => handleFilterChange({ search })}
            onFlowTypeChange={(flowType) => handleFilterChange({ flowType })}
            onReset={() => handleFilterChange({ search: '', flowType: '' })}
          />

          {/* Paginated Interactive Table */}
          <TransactionTable
            pageData={transactionsPage}
            loading={loadingTransactions}
            onPageChange={handlePageChange}
            onSelectTransaction={(tx) => setSelectedTransaction(tx)}
          />
        </section>
      </main>

      {/* 3. Native Accessible Transaction Detail Dialog */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}

export default App;
