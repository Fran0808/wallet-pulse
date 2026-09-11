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
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans selection:bg-[#00d09c]/30">
      <HeaderPulse
        isSyncing={isSyncing}
        onSync={triggerEmailSync}
        syncResult={syncResult}
        error={error}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <section aria-labelledby="summary-heading">
          <div className="mb-4">
            <h2 id="summary-heading" className="text-base font-semibold text-white">
              Resumen Financiero Consolidado
            </h2>
            <p className="text-xs text-slate-400">
              Datos calculados en tiempo real desde notificaciones BCP y Yape
            </p>
          </div>
          <FinancialSummaryCards summary={summary} loading={loadingSummary} />
        </section>
        <section className="p-6 rounded-xl bg-[#111827] border border-slate-800 text-center py-12">
          <p className="text-slate-300 font-medium">Próximo paso: Libro de Transacciones (Fase 4)</p>
          <p className="text-xs text-slate-500 mt-1">
            Aquí se desplegará la tabla interactiva de compras con filtros dinámicos.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
