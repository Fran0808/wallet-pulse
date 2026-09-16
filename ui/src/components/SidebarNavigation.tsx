import React from 'react';
import {
  Activity,
  Wallet,
  Receipt,
  CreditCard,
  PieChart,
  Settings,
  Zap,
} from 'lucide-react';

export type NavView = 'inicio' | 'mi-dinero' | 'movimientos' | 'tarjetas' | 'presupuestos' | 'configuracion';

interface SidebarNavigationProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
}

interface NavItem {
  id: NavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'inicio', label: 'Pulso de Inicio', icon: Activity },
  { id: 'mi-dinero', label: 'Mi Dinero & Flujo', icon: Wallet },
  { id: 'movimientos', label: 'Movimientos', icon: Receipt },
  { id: 'tarjetas', label: 'Tarjetas & Cuentas', icon: CreditCard },
  { id: 'presupuestos', label: 'Presupuestos', icon: PieChart, badge: 'Pronto' },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeView,
  onViewChange,
}) => {
  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 select-none">
      {/* 1. Brand & Core Identity */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white">Wallet<span className="text-emerald-400">Pulse</span></span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">Cashflow Console</p>
          </div>
        </div>

        {/* 2. Main Navigation Links */}
        <nav className="mt-8 space-y-1.5" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 to-indigo-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

    </aside>
  );
};
