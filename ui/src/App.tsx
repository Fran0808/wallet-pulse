import { useState } from 'react';
import { HeaderPulse } from './components/HeaderPulse';
import { CleverHeroBanner } from './components/CleverHeroBanner';
import { TransactionTable } from './components/TransactionTable';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { useFinance } from './hooks/useFinance';
import type { Transaction } from './types';

export function App() {
  const {
    periodAnalytics,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20">
      {/* 1. Header Pulse */}
      <HeaderPulse
        isSyncing={isSyncing}
        onSync={triggerEmailSync}
        syncResult={syncResult}
        error={error}
      />

      {/* 2. Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section: Clever-style Period Cashflow */}
        <section aria-labelledby="hero-heading">
          <h2 id="hero-heading" className="sr-only">
            Resumen Financiero del Período
          </h2>
          <CleverHeroBanner analytics={periodAnalytics} loading={loadingSummary} />
        </section>

        {/* Transactions Ledger with Dynamic Filters */}
        <section aria-labelledby="transactions-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 id="transactions-heading" className="text-lg font-bold text-slate-900">
                Movimientos Recientes
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Compras con tarjeta BCP, transferencias y consumos indexados
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
