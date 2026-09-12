import type {
  FinancialSummary,
  PeriodAnalytics,
  Transaction,
  PageResponse,
  EmailSyncResponse,
  EmailConnectionStatus,
  FlowType,
} from '../types';

const BASE_URL = '/api/v1';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // Keep default message if not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export interface TransactionFilterParams {
  page?: number;
  size?: number;
  flowType?: FlowType | '';
  search?: string;
}

export const api = {
  async getFinancialSummary(): Promise<FinancialSummary> {
    const response = await fetch(`${BASE_URL}/analytics/summary`);
    return handleResponse<FinancialSummary>(response);
  },

  async getPeriodAnalytics(year?: number, month?: number): Promise<PeriodAnalytics> {
    const query = new URLSearchParams();
    if (year) query.set('year', String(year));
    if (month) query.set('month', String(month));
    const qs = query.toString() ? `?${query.toString()}` : '';

    const response = await fetch(`${BASE_URL}/analytics/period${qs}`);
    return handleResponse<PeriodAnalytics>(response);
  },

  async getTransactions(params: TransactionFilterParams = {}): Promise<PageResponse<Transaction>> {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 10));

    if (params.flowType) {
      query.set('flowType', params.flowType);
    }
    if (params.search && params.search.trim()) {
      query.set('search', params.search.trim());
    }

    const response = await fetch(`${BASE_URL}/transactions?${query.toString()}`);
    return handleResponse<PageResponse<Transaction>>(response);
  },

  async syncEmails(): Promise<EmailSyncResponse> {
    const response = await fetch(`${BASE_URL}/emails/sync`, {
      method: 'POST',
    });
    return handleResponse<EmailSyncResponse>(response);
  },

  async testEmailConnection(): Promise<EmailConnectionStatus> {
    const response = await fetch(`${BASE_URL}/emails/test-connection`);
    return handleResponse<EmailConnectionStatus>(response);
  },
};
