import type { Receipt } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Card } from '../ui/Card';
import { StatusBadge } from './StatusBadge';

interface ReceiptCardProps {
  receipt: Receipt;
}

function pickMerchant(receipt: Receipt): string {
  return receipt.merchantName ?? receipt.merchant_name ?? 'Unknown merchant';
}

function pickDate(receipt: Receipt): string | undefined {
  return receipt.transactionDate ?? receipt.transaction_date;
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const merchant = pickMerchant(receipt);
  const date = pickDate(receipt);
  const total = formatCurrency(receipt.total);
  const category = receipt.category || 'Uncategorized';

  return (
    <Card interactive className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium tracking-tight text-foreground">
              {merchant}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(date)}
          </p>
        </div>
        <StatusBadge status={receipt.status} />
      </div>

      <div className="grid grid-cols-2 gap-px bg-border mt-5 border-t border-border">
        <Field label="Total" value={total} mono />
        <Field label="Category" value={category} />
      </div>

      {receipt.notes && (
        <div className="border-t border-border bg-muted/30 px-5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Notes
          </p>
          <p className="mt-1 text-sm text-foreground/90">{receipt.notes}</p>
        </div>
      )}
    </Card>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-surface px-5 py-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={
          'mt-1 text-sm text-foreground ' + (mono ? 'font-mono tabular-nums' : '')
        }
      >
        {value}
      </p>
    </div>
  );
}
