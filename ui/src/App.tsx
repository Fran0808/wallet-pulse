export function App() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 p-8">
      <header className="max-w-6xl mx-auto border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="inline-block w-3 h-3 rounded-full bg-[#00d09c] shadow-[0_0_12px_#00d09c]" />
          WalletPulse
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Personal Financial Intelligence Dashboard
        </p>
      </header>
      <main className="max-w-6xl mx-auto mt-8">
        <div className="p-6 rounded-xl bg-[#111827] border border-slate-800">
          <p className="text-emerald-400 font-medium">Fase 1 completada con éxito</p>
          <p className="text-slate-400 text-sm mt-1">
            Tailwind CSS v4, TypeScript y tokens de diseño cargados.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
