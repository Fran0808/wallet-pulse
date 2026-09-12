import React from 'react';
import {
  CreditCard,
  Smartphone,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Eye,
} from 'lucide-react';
import type { Transaction, PageResponse } from '../types';
import { formatCurrency, formatDate, getChannelLabel } from '../utils/formatters';

interface TransactionTableProps {
  pageData: PageResponse<Transaction> | null;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  pageData,
  loading,
  onPageChange,
  onSelectTransaction,
}) => {
  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'TARJETA_CREDITO_BCP':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
            <span>Crédito BCP</span>
          </span>
        );
      case 'TARJETA_DEBITO_BCP':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            <CreditCard className="w-3.5 h-3.5 text-sky-600" />
            <span>Débito BCP</span>
          </span>
        );
      case 'YAPE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            <span>Yape</span>
          </span>
        );
      case 'BCP_TRANSFERENCIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Transferencia</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {getChannelLabel(channel)}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header section of Table */}
      <div className="px-6 py-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Registro de Transacciones</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Haz clic en cualquier fila para inspeccionar el hash de auditoría y los detalles
          </p>
        </div>
        {pageData && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
            {pageData.totalElements} movimientos registrados
          </span>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Historial paginado de transacciones bancarias</caption>
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th scope="col" className="py-3.5 px-6">Comercio / Destino</th>
              <th scope="col" className="py-3.5 px-6">Canal Bancario</th>
              <th scope="col" className="py-3.5 px-6">Fecha & Hora</th>
              <th scope="col" className="py-3.5 px-6 text-right">Importe</th>
              <th scope="col" className="py-3.5 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              [...Array(6)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-6">
                    <div className="h-4 w-40 bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-6 w-28 bg-slate-200 rounded-lg" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="h-5 w-24 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-6 w-6 bg-slate-200 rounded-full mx-auto" />
                  </td>
                </tr>
              ))
            ) : !pageData || pageData.content.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 px-6 text-center">
                  <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-400 mb-3">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <p className="text-slate-700 font-semibold text-sm">No se encontraron transacciones</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Sincroniza tus correos o ajusta los filtros de búsqueda.
                  </p>
                </td>
              </tr>
            ) : (
              pageData.content.map((tx) => {
                const isIncome = tx.flowType === 'INCOME';
                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Contact / Merchant */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl flex-shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {tx.contactName || 'Consumo no especificado'}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            ID: #{tx.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Channel Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getChannelBadge(tx.channel)}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-600 font-medium">
                      {formatDate(tx.transactionDate)}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span
                        className={`font-extrabold font-num text-sm sm:text-base ${
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+ ' : '- '}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Action Eye */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-100/60 inline-flex transition-colors">
                        <Eye className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pageData && pageData.totalPages > 1 && (
        <nav
          aria-label="Paginación de transacciones"
          className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
        >
          <div className="text-xs text-slate-500 font-medium">
            Página <strong className="text-slate-800">{pageData.number + 1}</strong> de{' '}
            <strong className="text-slate-800">{pageData.totalPages}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(pageData.number - 1)}
              disabled={pageData.first || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              type="button"
              onClick={() => onPageChange(pageData.number + 1)}
              disabled={pageData.last || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
