import type { ReceiptStatus } from '../../types';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status?: ReceiptStatus;
  className?: string;
}

interface StatusStyle {
  label: string;
  classes: string;
  dot: string;
}

function styleFor(status?: string): StatusStyle {
  switch ((status ?? '').toLowerCase()) {
    case 'processed':
      return {
        label: 'Processed',
        classes:
          'border-success/30 bg-success/10 text-success dark:bg-success/15',
        dot: 'bg-success',
      };
    case 'pending':
      return {
        label: 'Pending',
        classes:
          'border-warning/30 bg-warning/10 text-warning dark:bg-warning/15',
        dot: 'bg-warning',
      };
    case 'failed':
      return {
        label: 'Failed',
        classes: 'border-danger/30 bg-danger/10 text-danger dark:bg-danger/15',
        dot: 'bg-danger',
      };
    case 'uploaded':
      return {
        label: 'Uploaded',
        classes: 'border-info/30 bg-info/10 text-info dark:bg-info/15',
        dot: 'bg-info',
      };
    default:
      return {
        label: status || 'Unknown',
        classes:
          'border-border bg-muted/60 text-muted-foreground',
        dot: 'bg-muted-foreground',
      };
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, classes, dot } = styleFor(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
        classes,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
}
