import React, { useState, useEffect } from 'react';
import { Search, X, TrendingDown, TrendingUp, Layers, ArrowLeftRight } from 'lucide-react';
import type { FlowType } from '../../types';

interface TransactionFiltersProps {
  search: string;
  flowType: FlowType | '';
  onSearchChange: (value: string) => void;
  onFlowTypeChange: (value: FlowType | '') => void;
  onReset: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  search,
  flowType,
  onSearchChange,
  onFlowTypeChange,
  onReset,
}) => {
  // Local state for immediate typing responsiveness
  const [localSearch, setLocalSearch] = useState(search);

  // Sync when search prop changes externally (e.g. onReset)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search query by 300ms to avoid flashing requests
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, search, onSearchChange]);

  const hasActiveFilters = Boolean(localSearch.trim() || flowType);

  const handleClear = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* 1. Search Input with Debounce */}
      <div className="relative flex-1 max-w-md">
        <label htmlFor="search-input" className="sr-only">
          Buscar por comercio o contacto
        </label>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          id="search-input"
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Buscar por comercio, contacto o servicio..."
          className="block w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 2. Flow Type Segmented Control */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 flex-wrap">
          <button
            type="button"
            onClick={() => onFlowTypeChange('')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              flowType === ''
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos</span>
          </button>

          <button
            type="button"
            onClick={() => onFlowTypeChange('EXPENSE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              flowType === 'EXPENSE'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            <span>Gastos</span>
          </button>

          <button
            type="button"
            onClick={() => onFlowTypeChange('INCOME')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              flowType === 'INCOME'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ingresos</span>
          </button>

          <button
            type="button"
            onClick={() => onFlowTypeChange('INTERNAL_TRANSFER')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              flowType === 'INTERNAL_TRANSFER'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-teal-600" />
            <span>Transferencias</span>
          </button>
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch('');
              onReset();
            }}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};
