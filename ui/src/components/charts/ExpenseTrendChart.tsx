import type { DailyExpense } from '../../types';
import { formatCurrency } from '../../utils';

interface ExpenseTrendChartProps {
  points: DailyExpense[];
  monthLabel: string;
}

export function ExpenseTrendChart({ points, monthLabel }: ExpenseTrendChartProps) {
  const total = points.at(-1)?.cumulativeAmount ?? 0;

  if (points.length === 0 || total === 0) {
    return <p className="py-12 text-sm text-muted">Aún no hay gastos para mostrar en este período.</p>;
  }

  const left = 12;
  const right = 708;
  const top = 14;
  const bottom = 178;
  const maxValue = Math.max(total, ...points.map((point) => point.cumulativeAmount));
  const x = (index: number) => left + (points.length === 1 ? 0 : index / (points.length - 1)) * (right - left);
  const y = (amount: number) => bottom - (amount / maxValue) * (bottom - top);
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.cumulativeAmount)}`).join(' ');
  const area = `${line} L ${x(points.length - 1)} ${bottom} L ${left} ${bottom} Z`;
  const middle = Math.floor((points.length - 1) / 2);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Total acumulado</p>
          <p className="font-display font-num mt-1 text-2xl font-semibold">{formatCurrency(total)}</p>
        </div>
        <p className="text-xs text-muted">Solo gastos confirmados · transferencias excluidas</p>
      </div>
      <svg className="h-auto w-full" viewBox="0 0 720 210" role="img" aria-label={`Evolución del gasto acumulado en ${monthLabel}: ${formatCurrency(total)} hasta el día ${points.at(-1)?.day}`}>
        <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="var(--color-line)" />
        <line x1={left} y1={y(maxValue / 2)} x2={right} y2={y(maxValue / 2)} stroke="var(--color-line)" strokeDasharray="3 5" />
        <path d={area} fill="var(--color-brand)" fillOpacity="0.08" />
        <path d={line} fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(points.length - 1)} cy={y(total)} r="4" fill="var(--color-brand)" />
        <g fill="var(--color-muted)" fontSize="11" fontFamily="inherit">
          <text x={left} y="202">Día 1</text>
          {points.length > 2 && <text x={x(middle)} y="202" textAnchor="middle">Día {points[middle].day}</text>}
          <text x={right} y="202" textAnchor="end">Día {points.at(-1)?.day}</text>
        </g>
      </svg>
    </div>
  );
}
