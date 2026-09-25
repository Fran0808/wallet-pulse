interface PeriodSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function PeriodSelector({ year, month, onChange }: PeriodSelectorProps) {
  const years = Array.from(
    { length: Math.max(new Date().getFullYear() + 1, year) - 2025 + 1 },
    (_, index) => 2025 + index,
  );

  return (
    <div className="flex items-center gap-1 rounded-xl border border-line bg-white px-2.5 py-1.5" aria-label="Período seleccionado">
      <label htmlFor="period-month" className="sr-only">Mes</label>
      <select
        id="period-month"
        value={month}
        onChange={(event) => onChange(year, Number(event.target.value))}
        className="cursor-pointer bg-transparent px-1 py-1 text-sm font-semibold text-ink"
      >
        {MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
      </select>
      <span className="text-line" aria-hidden="true">/</span>
      <label htmlFor="period-year" className="sr-only">Año</label>
      <select
        id="period-year"
        value={year}
        onChange={(event) => onChange(Number(event.target.value), month)}
        className="cursor-pointer bg-transparent px-1 py-1 text-sm font-semibold text-ink"
      >
        {years.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
    </div>
  );
}
