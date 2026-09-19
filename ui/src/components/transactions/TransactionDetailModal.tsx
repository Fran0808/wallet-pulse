import React, { useEffect, useRef } from 'react';
import { X, Copy, Check, ShieldCheck, CreditCard, Calendar, Hash } from 'lucide-react';
import type { Transaction } from '../../types';
import { formatCurrency, formatDate, getChannelLabel } from '../../utils';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (transaction) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [transaction]);

  const handleCopyHash = () => {
    if (!transaction?.transactionHash) return;
    navigator.clipboard.writeText(transaction.transactionHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  if (!transaction) return null;

  const isIncome = transaction.flowType === 'INCOME';

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="backdrop:bg-slate-900/40 backdrop:backdrop-blur-xs rounded-2xl p-0 max-w-lg w-full bg-white shadow-2xl border border-slate-200/80 m-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Auditoría de Transacción</h3>
              <p className="text-xs text-slate-500">Comprobante verificado con firma hash</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Amount Card */}
        <div className="my-6 text-center p-6 rounded-2xl bg-slate-50 border border-slate-200/60">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isIncome ? 'Importe Ingresado' : 'Importe Pagado'}
          </span>
          <p
            className={`text-4xl font-extrabold font-num tracking-tight mt-1 ${
              isIncome ? 'text-emerald-600' : 'text-slate-900'
            }`}
          >
            {isIncome ? '+ ' : '- '}
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            {transaction.contactName || 'Consumo no especificado'}
          </p>
        </div>

        {/* Details Grid */}
        <div className="space-y-3.5 text-sm">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              Canal de Ingestión
            </span>
            <span className="font-semibold text-slate-800 text-xs">
              {getChannelLabel(transaction.channel)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Fecha y Hora
            </span>
            <span className="font-semibold text-slate-800 text-xs">
              {formatDate(transaction.transactionDate)}
            </span>
          </div>

          {/* Cryptographic Hash */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Hash className="w-3.5 h-3.5 text-indigo-500" />
                Hash Criptográfico SHA-256 (Idempotencia)
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-600 break-all bg-white p-2 rounded-lg border border-slate-200/80 select-all">
              {transaction.transactionHash}
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </dialog>
  );
};
