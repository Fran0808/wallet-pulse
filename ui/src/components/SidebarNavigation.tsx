import React from 'react';
import {
  Activity,
  Wallet,
  Receipt,
  CreditCard,
  PieChart,
  Settings,
  Zap,
  LogOut,
} from 'lucide-react';
import type { UserProfile } from '../types';

export type NavView = 'inicio' | 'mi-dinero' | 'movimientos' | 'tarjetas' | 'presupuestos' | 'configuracion';

interface SidebarNavigationProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  user?: UserProfile | null;
  onLogout?: () => void;
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
  user,
  onLogout,
}) => {
  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 select-none">
      {/* 1. Brand & Core Identity */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/10 flex items-center justify-center">
            <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white">Wallet<span className="text-blue-400">Pulse</span></span>
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
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. User Profile Card & Logout */}
      {user && (
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.pictureUrl ? (
                <img
                  src={user.pictureUrl}
                  alt={user.fullName || user.email}
                  className="h-8 w-8 rounded-full border border-slate-700 object-cover shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30 shrink-0">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user.fullName || user.email.split('@')[0]}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
