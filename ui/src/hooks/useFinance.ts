import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { TransactionFilterParams } from '../services/api';
import type { FinancialSummary, Transaction, PageResponse, EmailSyncResponse } from '../types';

export function useFinance() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactionsPage, setTransactionsPage] = useState<PageResponse<Transaction> | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<EmailSyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<TransactionFilterParams>({
    page: 0,
    size: 10,
    flowType: '',
    search: '',
  });

  const loadSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const data = await api.getFinancialSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar resumen');
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      const data = await api.getTransactions(filters);
      setTransactionsPage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones');
    } finally {
      setLoadingTransactions(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const triggerEmailSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      const result = await api.syncEmails();
      setSyncResult(result);
      // Reload both summary and transactions after successful sync
      await Promise.all([loadSummary(), loadTransactions()]);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al sincronizar correos';
      setError(msg);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters: Partial<TransactionFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }));
  };

  return {
    summary,
    transactionsPage,
    loadingSummary,
    loadingTransactions,
    isSyncing,
    syncResult,
    error,
    filters,
    handlePageChange,
    handleFilterChange,
    triggerEmailSync,
    refreshAll: async () => {
      await Promise.all([loadSummary(), loadTransactions()]);
    },
  };
}
