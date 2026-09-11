import { HeaderPulse } from './components/HeaderPulse';
import { FinancialSummaryCards } from './components/FinancialSummaryCards';
import { useFinance } from './hooks/useFinance';

export function App() {
  const {
    summary,
    loadingSummary,
    isSyncing,
    syncResult,
    error,
    triggerEmailSync,
  } = useFinance();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20">
      {/* 1. Header Pulse (Light & Crisp) */}
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
          <div className="mb-5">
            <h2 id="summary-heading" className="text-lg font-bold text-slate-900">
              Resumen Financiero Consolidado
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Cálculo en vivo de ingresos y egresos capturados automáticamente
            </p>
          </div>
          <FinancialSummaryCards summary={summary} loading={loadingSummary} />
        </section>

        {/* Section placeholder for Phase 4 & 5 */}
        <section className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center py-14">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
            <span className="text-sm font-semibold">Fase 4 Siguiente</span>
          </div>
          <p className="text-slate-900 font-bold text-base">Libro de Transacciones Bancarias</p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Aquí construiremos la tabla paginada con badges vibrantes por cada canal (Crédito BCP, Débito, Yape).
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
