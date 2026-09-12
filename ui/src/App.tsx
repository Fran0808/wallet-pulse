import { HeaderPulse } from './components/HeaderPulse';
import { FinancialSummaryCards } from './components/FinancialSummaryCards';
import { TransactionTable } from './components/TransactionTable';
import { useFinance } from './hooks/useFinance';

export function App() {
  const {
    summary,
    transactionsPage,
    loadingSummary,
    loadingTransactions,
    isSyncing,
    syncResult,
    error,
    handlePageChange,
    triggerEmailSync,
  } = useFinance();

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

        {/* Section: Transactions Ledger (Phase 4) */}
        <section aria-labelledby="transactions-heading">
          <div className="mb-4">
            <h2 id="transactions-heading" className="text-lg font-bold text-slate-900">
              Movimientos Recientes
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Transacciones indexadas de compras con tarjeta BCP y abonos
            </p>
          </div>

          <TransactionTable
            pageData={transactionsPage}
            loading={loadingTransactions}
            onPageChange={handlePageChange}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
