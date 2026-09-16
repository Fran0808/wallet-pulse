import React from 'react';
import { Store, ShoppingBag, ChevronRight } from 'lucide-react';
import type { TopMerchant } from '../types';
import { formatCurrency } from '../utils/formatters';

interface TopMerchantsCardProps {
  merchants: TopMerchant[];
  loading: boolean;
}

export const TopMerchantsCard: React.FC<TopMerchantsCardProps> = ({ merchants, loading }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Store className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Principales comercios</h3>
              <p className="text-[11px] text-slate-500 font-medium">Dónde compraste más veces este período</p>
            </div>
          </div>
        </div>

        {/* Merchant list */}
        <div className={`mt-3 divide-y divide-slate-100 transition-opacity duration-200 ${loading ? 'opacity-70' : 'opacity-100'}`}>
          {loading && (!merchants || merchants.length === 0) ? (
            [...Array(3)].map((_, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-200" />
                  <div>
                    <div className="h-3.5 w-28 bg-slate-200 rounded mb-1" />
                    <div className="h-2.5 w-16 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
            ))
          ) : !merchants || merchants.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Sin consumos en este período seleccionado.
            </div>
          ) : (
            merchants.map((m, idx) => (
              <div
                key={idx}
                className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-1 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-700 flex items-center justify-center flex-shrink-0 transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                      {m.merchantName || 'Consumo BCP'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {m.transactionCount} {m.transactionCount === 1 ? 'consumo' : 'consumos'} · {m.percentage}% del gasto
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                  <span className="text-xs font-extrabold font-num text-slate-900">
                    {formatCurrency(m.totalAmount)}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
