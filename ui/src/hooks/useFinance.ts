import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { TransactionFilterParams } from '../services/api';
import type { FinancialSummary, PeriodAnalytics, Transaction, PageResponse, EmailSyncResponse } from '../types';

function getPeriodDateRange(year: number, month: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return {
    startDate: `${year}-${pad(month)}-01T00:00:00`,
    endDate: `${year}-${pad(month)}-${pad(lastDay)}T23:59:59`,
  };
}

export function useFinance() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [periodAnalytics, setPeriodAnalytics] = useState<PeriodAnalytics | null>(null);
  const [transactionsPage, setTransactionsPage] = useState<PageResponse<Transaction> | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<EmailSyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriodState] = useState<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const [filters, setFilters] = useState<TransactionFilterParams>({
    page: 0,
    size: 10,
    flowType: '',
    search: '',
  });

  const setSelectedPeriod = (period: { year: number; month: number }) => {
    setSelectedPeriodState(period);
    setFilters((prev) => ({ ...prev, page: 0 }));
  };

  const loadSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const [sumData, periodData] = await Promise.all([
        api.getFinancialSummary(),
        api.getPeriodAnalytics(selectedPeriod.year, selectedPeriod.month),
      ]);
      setSummary(sumData);
      setPeriodAnalytics(periodData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar analítica financiera');
    } finally {
      setLoadingSummary(false);
    }
  }, [selectedPeriod]);

  const loadTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      const dateRange = getPeriodDateRange(selectedPeriod.year, selectedPeriod.month);
      const data = await api.getTransactions({
        ...filters,
        ...dateRange,
      });
      setTransactionsPage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones');
    } finally {
      setLoadingTransactions(false);
    }
  }, [filters, selectedPeriod]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSyncing) {
        loadSummary();
        loadTransactions();
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [loadSummary, loadTransactions, isSyncing]);

  const triggerEmailSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      const result = await api.syncEmails();
      setSyncResult(result);
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
    periodAnalytics,
    transactionsPage,
    loadingSummary,
    loadingTransactions,
    isSyncing,
    syncResult,
    error,
    filters,
    selectedPeriod,
    setSelectedPeriod,
    handlePageChange,
    handleFilterChange,
    triggerEmailSync,
    refreshAll: async () => {
      await Promise.all([loadSummary(), loadTransactions()]);
    },
  };
}
