import { useState } from 'react';
import { SidebarNavigation } from './components/SidebarNavigation';
import type { NavView } from './components/SidebarNavigation';
import { HomeView } from './components/views/HomeView';
import { MyMoneyView } from './components/views/MyMoneyView';
import { TransactionsView } from './components/views/TransactionsView';
import { PlaceholderView } from './components/views/PlaceholderView';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { LoginView } from './components/auth/LoginView';
import { useAuth } from './contexts/AuthContext';
import { useFinance } from './hooks/useFinance';
import type { Transaction } from './types';
import { Menu, X, LogOut, Loader2 } from 'lucide-react';

export function App() {
  const { user, loading: loadingAuth, logout } = useAuth();
  const {
    periodAnalytics,
    transactionsPage,
    loadingSummary,
    loadingTransactions,
    error,
    filters,
    selectedPeriod,
    setSelectedPeriod,
    handlePageChange,
    handleFilterChange,
  } = useFinance();

  const [activeView, setActiveView] = useState<NavView>('inicio');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-200">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-400">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex font-sans selection:bg-blue-500/20">
      {/* 1. Mobile Sidebar Backdrop Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 2. Sidebar Navigation (FEAT-001) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarNavigation
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            setMobileMenuOpen(false);
          }}
          user={user}
          onLogout={logout}
        />
      </div>

      {/* 3. Main Application Container (FEAT-002) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
              {activeView === 'inicio'
                ? 'Tablero de Control'
                : activeView === 'mi-dinero'
                ? 'Centro Analítico'
                : activeView === 'movimientos'
                ? 'Libro de Transacciones'
                : 'Módulo del Sistema'}
            </span>
          </div>

          {/* Right Header Badges & User Profile */}
          <div className="flex items-center gap-3">
            {error && (
              <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                {error}
              </span>
            )}

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80">
              {user.pictureUrl ? (
                <img
                  src={user.pictureUrl}
                  alt={user.fullName || user.email}
                  className="h-8 w-8 rounded-full border border-slate-200 object-cover shadow-xs"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight truncate max-w-[140px]">
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Cerrar sesión"
                className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'inicio' && (
            <HomeView
              analytics={periodAnalytics}
              recentTransactions={transactionsPage?.content || []}
              loading={loadingSummary || loadingTransactions}
              onNavigateToTransactions={() => setActiveView('movimientos')}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              selectedYear={selectedPeriod.year}
              selectedMonth={selectedPeriod.month}
              onPeriodChange={(year, month) => setSelectedPeriod({ year, month })}
            />
          )}

          {activeView === 'mi-dinero' && (
            <MyMoneyView
              analytics={periodAnalytics}
              loading={loadingSummary}
              selectedYear={selectedPeriod.year}
              selectedMonth={selectedPeriod.month}
            />
          )}

          {activeView === 'movimientos' && (
            <TransactionsView
              pageData={transactionsPage}
              loading={loadingTransactions}
              filters={filters}
              onFilterChange={handleFilterChange}
              onPageChange={handlePageChange}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              periodName={periodAnalytics ? `${periodAnalytics.periodName} ${selectedPeriod.year}` : undefined}
            />
          )}

          {['tarjetas', 'presupuestos', 'configuracion'].includes(activeView) && (
            <PlaceholderView
              view={activeView}
              onNavigateHome={() => setActiveView('inicio')}
            />
          )}
        </main>
      </div>

      {/* 4. Native Accessible Transaction Detail Dialog */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}

export default App;
