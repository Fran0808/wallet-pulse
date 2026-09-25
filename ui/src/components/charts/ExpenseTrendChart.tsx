import { useState, type PointerEvent, type KeyboardEvent } from 'react';
import type { DailyExpense } from '../../types';
import { formatCurrency } from '../../utils';

interface ExpenseTrendChartProps {
  points: DailyExpense[];
  monthLabel: string;
}

export function ExpenseTrendChart({ points, monthLabel }: ExpenseTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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
  const activePoint = activeIndex === null ? null : points[activeIndex] ?? null;

  const handleLinePointerMove = (event: PointerEvent<SVGPathElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();
    const svgX = ((event.clientX - bounds.left) / bounds.width) * 720;
    const nearestIndex = Math.round(((svgX - left) / (right - left)) * (points.length - 1));
    setActiveIndex(Math.max(0, Math.min(points.length - 1, nearestIndex)));
  };

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    setActiveIndex((current) => Math.max(0, Math.min(points.length - 1, (current ?? points.length - 1) + direction)));
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Total acumulado</p>
          <p className="font-display font-num mt-1 text-2xl font-semibold">{formatCurrency(total)}</p>
        </div>
        <p className="text-xs text-muted">Solo gastos confirmados · transferencias excluidas</p>
      </div>
      <div className="relative">
        <svg
          className="h-auto w-full rounded-lg"
          viewBox="0 0 720 210"
          role="group"
          tabIndex={0}
          aria-label={`Evolución del gasto acumulado en ${monthLabel}: ${formatCurrency(total)} hasta el día ${points.at(-1)?.day}. Usa las flechas izquierda y derecha para explorar los días.`}
          onFocus={() => setActiveIndex(points.length - 1)}
          onBlur={() => setActiveIndex(null)}
          onKeyDown={handleKeyDown}
        >
          <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="var(--color-line)" />
          <line x1={left} y1={y(maxValue / 2)} x2={right} y2={y(maxValue / 2)} stroke="var(--color-line)" strokeDasharray="3 5" />
          <path d={area} fill="var(--color-brand)" fillOpacity="0.08" />
          <path d={line} fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={x(points.length - 1)} cy={y(total)} r="4" fill="var(--color-brand)" pointerEvents="none" />
          {activePoint && activeIndex !== null && (
            <g pointerEvents="none">
              <line x1={x(activeIndex)} y1={top} x2={x(activeIndex)} y2={bottom} stroke="var(--color-brand)" strokeDasharray="4 5" opacity="0.45" />
              <circle cx={x(activeIndex)} cy={y(activePoint.cumulativeAmount)} r="6" fill="var(--color-brand)" stroke="white" strokeWidth="2" />
            </g>
          )}
          <path
            d={line}
            fill="none"
            stroke="transparent"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            onPointerMove={handleLinePointerMove}
            onPointerLeave={() => setActiveIndex(null)}
          />
          <g fill="var(--color-muted)" fontSize="11" fontFamily="inherit" pointerEvents="none">
            <text x={left} y="202">Día 1</text>
            {points.length > 2 && <text x={x(middle)} y="202" textAnchor="middle">Día {points[middle].day}</text>}
            <text x={right} y="202" textAnchor="end">Día {points.at(-1)?.day}</text>
          </g>
        </svg>
        {activePoint && activeIndex !== null && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute z-10 min-w-44 rounded-xl border border-line bg-white px-3 py-2.5 text-xs shadow-lg"
            style={{
              left: `clamp(7rem, ${(x(activeIndex) / 720) * 100}%, calc(100% - 7rem))`,
              top: `${(y(activePoint.cumulativeAmount) / 210) * 100}%`,
              transform: y(activePoint.cumulativeAmount) < 65
                ? 'translate(-50%, 14px)'
                : 'translate(-50%, calc(-100% - 14px))',
            }}
          >
            <p className="font-semibold text-ink">{activePoint.day} de {monthLabel}</p>
            <p className="font-num mt-1 text-muted">Gasto del día: <span className="font-semibold text-ink">{formatCurrency(activePoint.amount)}</span></p>
            <p className="font-num mt-0.5 text-muted">Acumulado: <span className="font-semibold text-brand">{formatCurrency(activePoint.cumulativeAmount)}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
