import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { FlowType } from '../../types';

interface TransactionFiltersProps {
  search: string;
  flowType: FlowType | '';
  onSearchChange: (value: string) => void;
  onFlowTypeChange: (value: FlowType | '') => void;
  onReset: () => void;
}

const FLOW_OPTIONS: { value: FlowType | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'EXPENSE', label: 'Gastos' },
  { value: 'INCOME', label: 'Entradas' },
  { value: 'INTERNAL_TRANSFER', label: 'Transferencias' },
];

export function TransactionFilters({ search, flowType, onSearchChange, onFlowTypeChange, onReset }: TransactionFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full xl:max-w-sm">
        <label htmlFor="transaction-search" className="sr-only">Buscar por comercio o contacto</label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id="transaction-search"
          type="search"
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          placeholder="Buscar comercio o contacto"
          className="w-full rounded-xl border border-line bg-canvas py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-muted focus:border-brand focus:bg-white focus:outline-none"
        />
        {localSearch && (
          <button type="button" onClick={() => { setLocalSearch(''); onSearchChange(''); }} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2" aria-label="Filtrar por tipo de movimiento">
        {FLOW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onFlowTypeChange(option.value)}
            aria-pressed={flowType === option.value}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${flowType === option.value ? 'bg-brand text-white' : 'text-muted hover:bg-canvas hover:text-ink'}`}
          >
            {option.label}
          </button>
        ))}
        {(localSearch.trim() || flowType) && (
          <button type="button" onClick={() => { setLocalSearch(''); onReset(); }} className="px-2 py-2 text-sm text-muted hover:text-ink">Limpiar</button>
        )}
      </div>
    </div>
  );
}
