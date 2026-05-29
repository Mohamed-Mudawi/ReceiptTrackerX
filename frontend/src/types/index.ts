export type ReceiptStatus =
  | 'Processed'
  | 'Pending'
  | 'Failed'
  | 'Uploaded'
  | 'Unknown'
  | (string & {});

/**
 * The backend has shipped receipts under both camelCase and snake_case at
 * various points, so we accept either shape and normalise at the call site.
 */
export interface Receipt {
  id: string;
  merchantName?: string;
  merchant_name?: string;
  transactionDate?: string;
  transaction_date?: string;
  total?: number | string;
  category?: string;
  status?: ReceiptStatus;
  notes?: string;
}

export type Summary = Record<string, number | string | null | undefined>;

export type Theme = 'light' | 'dark';
