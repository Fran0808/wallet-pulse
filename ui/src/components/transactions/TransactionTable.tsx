import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Transaction, PageResponse } from '../../types';
import { formatCurrency, formatDate, getChannelLabel } from '../../utils';

interface TransactionTableProps {
  pageData: PageResponse<Transaction> | null;
  loading: boolean;
  periodName?: string;
  onPageChange: (page: number) => void;
  onSelectTransaction: (transaction: Transaction) => void;
}

export function TransactionTable({ pageData, loading, periodName, onPageChange, onSelectTransaction }: TransactionTableProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-lg font-semibold">Registro {periodName && <span className="ml-1 text-sm font-normal text-muted">· {periodName}</span>}</h2>
          <p className="mt-1 text-sm text-muted">{pageData ? `${pageData.totalElements} movimientos` : 'Cargando movimientos'}</p>
        </div>
        {loading && <span role="status" className="text-sm text-muted">Actualizando...</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <caption className="sr-only">Movimientos del período seleccionado</caption>
          <thead>
            <tr className="border-y border-line bg-canvas/70 text-xs font-semibold uppercase tracking-wider text-muted">
              <th scope="col" className="px-5 py-3 sm:px-6">Comercio o contacto</th>
              <th scope="col" className="px-4 py-3">Fecha</th>
              <th scope="col" className="px-4 py-3">Medio</th>
              <th scope="col" className="px-4 py-3 text-right">Importe</th>
              <th scope="col" className="px-5 py-3 text-right sm:px-6"><span className="sr-only">Detalle</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && !pageData ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted">Cargando movimientos...</td></tr>
            ) : !pageData?.content.length ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted">No se encontraron movimientos. Prueba otro período o ajusta los filtros.</td></tr>
            ) : pageData.content.map((transaction) => {
              const isIncome = transaction.flowType === 'INCOME';
              const isTransfer = transaction.flowType === 'INTERNAL_TRANSFER';
              const Icon = isIncome ? ArrowDownLeft : isTransfer ? ArrowLeftRight : ArrowUpRight;
              return (
                <tr key={transaction.id} className="transition-colors hover:bg-canvas/80">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isIncome ? 'bg-positive/10 text-positive' : isTransfer ? 'bg-brand/10 text-brand' : 'bg-negative/10 text-negative'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-48 truncate text-sm font-semibold text-ink">{transaction.contactName || 'Movimiento'}</span>
                        <span className="block text-xs text-muted">{isIncome ? 'Entrada' : isTransfer ? 'Transferencia propia' : 'Gasto'}</span>
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-muted">{formatDate(transaction.transactionDate)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-muted">{getChannelLabel(transaction.channel)}{transaction.cardLast4 ? ` ··${transaction.cardLast4}` : ''}</td>
                  <td className={`font-num whitespace-nowrap px-4 py-4 text-right text-sm font-semibold ${isIncome ? 'text-positive' : isTransfer ? 'text-muted' : 'text-ink'}`}>
                    {isIncome ? '+ ' : isTransfer ? '' : '− '}{formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    <button type="button" onClick={() => onSelectTransaction(transaction)} className="rounded-lg px-2 py-1 text-sm font-semibold text-brand hover:bg-brand/10" aria-label={`Ver detalle de ${transaction.contactName || 'movimiento'}`}>
                      Ver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageData && pageData.totalPages > 1 && (
        <nav aria-label="Paginación de movimientos" className="flex items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-6">
          <span className="text-sm text-muted">Página {pageData.number + 1} de {pageData.totalPages}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => onPageChange(pageData.number - 1)} disabled={pageData.first || loading} className="rounded-lg border border-line p-2 text-ink hover:bg-canvas disabled:opacity-40" aria-label="Página anterior"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => onPageChange(pageData.number + 1)} disabled={pageData.last || loading} className="rounded-lg border border-line p-2 text-ink hover:bg-canvas disabled:opacity-40" aria-label="Página siguiente"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </nav>
      )}
    </div>
  );
}
