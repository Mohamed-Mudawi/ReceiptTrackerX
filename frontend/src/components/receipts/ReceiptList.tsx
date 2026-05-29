import type { Receipt } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { ReceiptCard } from './ReceiptCard';

interface ReceiptListProps {
  receipts: Receipt[];
}

export function ReceiptList({ receipts }: ReceiptListProps) {
  if (receipts.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptIcon />}
        title="No receipts yet"
        description="Upload your first receipt to start tracking your spending. We'll extract merchant, total, and category automatically."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {receipts.map((receipt) => (
        <ReceiptCard key={receipt.id} receipt={receipt} />
      ))}
    </div>
  );
}

function ReceiptIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}
