export type FlowType = 'INCOME' | 'EXPENSE';

export type ChannelType =
  | 'TARJETA_CREDITO_BCP'
  | 'TARJETA_DEBITO_BCP'
  | 'YAPE'
  | 'BCP_TRANSFERENCIA'
  | 'PLIN'
  | 'UNKNOWN';

export interface Transaction {
  id: number;
  amount: number;
  flowType: FlowType;
  contactName: string;
  channel: ChannelType | string;
  transactionDate: string;
  transactionHash: string;
  createdAt: string;
}

export interface FinancialSummary {
  netBalance: number;
  totalExpense: number;
  totalIncome: number;
  totalTransactions: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface EmailSyncResponse {
  status: string;
  scannedCount: number;
  processedInBatch: number;
  savedCount: number;
  transactions: Transaction[];
  message: string;
}

export interface EmailConnectionStatus {
  status: string;
  connectedUser: string;
  totalInboxMessages: number;
  unreadMessages: number;
  matchedBcpEmailsCount: number;
  message?: string;
}
