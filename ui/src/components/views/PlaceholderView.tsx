import React from 'react';
import { CreditCard, PieChart, Settings, Sparkles, ArrowRight } from 'lucide-react';
import type { NavView } from '../SidebarNavigation';

interface PlaceholderViewProps {
  view: NavView;
  onNavigateHome: () => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ view, onNavigateHome }) => {
  const getMetadata = () => {
    switch (view) {
      case 'tarjetas':
        return {
          title: 'Tarjetas & Cuentas Vinculadas',
          description: 'Gestión y personalización de medios de pago, apodos de cuentas y límites.',
          icon: CreditCard,
          features: [
            'BCP Tarjeta de Crédito (··8037 y ··3127)',
            'Yape Billetera Digital vinculada a cuenta',
            'Sincronización en tiempo real vía Gmail API',
          ],
        };
      case 'presupuestos':
        return {
          title: 'Presupuestos & Límites Inteligentes',
          description: 'Fija topes mensuales por categoría o globales y recibe alertas de velocidad de gasto.',
          icon: PieChart,
          features: [
            'Presupuesto mensual con barra de alerta dinámica',
            'Detección de desvíos antes de cerrar la quincena',
            'Recomendación de ritmo de gasto diario',
          ],
        };
      case 'configuracion':
      default:
        return {
          title: 'Configuración & Seguridad',
          description: 'Ajustes del motor de ingesta, cuenta de Google OAuth2 y preferencias de interfaz.',
          icon: Settings,
          features: [
            'Estado de conexión OAuth2 y renovación de tokens',
            'Frecuencia de sincronización de segundo plano (60s)',
            'Reglas de exclusión de transferencias propias',
          ],
        };
    }
  };

  const meta = getMetadata();
  const Icon = meta.icon;

  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
        <Icon className="h-7 w-7" />
      </div>

      <div>
        <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
          Módulo en Expansión
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{meta.title}</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{meta.description}</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-left space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span>Capacidades del motor en este módulo:</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-600">
          {meta.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onNavigateHome}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
      >
        <span>Regresar al Pulso de Inicio</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
