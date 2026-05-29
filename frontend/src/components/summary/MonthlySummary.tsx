import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Summary } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface MonthlySummaryProps {
  summaries: Summary[];
}

interface MonthRow {
  key: string;
  label: string;
  total: number | null;
  count: number | null;
  updatedAt: string | null;
}

/* -----------------------------------------------------------------------------
 * Field readers — the API returns these in snake_case and occasionally with
 * "None" as the string for nulls, so be defensive about every shape.
 * -------------------------------------------------------------------------- */

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toString_(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value);
  if (!s || s === 'None' || s === 'null') return null;
  return s;
}

function pickField(summary: Summary, ...keys: string[]): unknown {
  for (const k of keys) {
    if (k in summary) return summary[k];
  }
  return undefined;
}

/* -----------------------------------------------------------------------------
 * Month key helpers — we normalise everything to "YYYY-MM" so months sort and
 * merge predictably. Summaries that don't carry a real month are dropped.
 * -------------------------------------------------------------------------- */

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function monthKeyOf(summary: Summary): string | null {
  const raw = toString_(summary.month);
  if (!raw) return null;
  const m = raw.match(/^(\d{4})-(\d{1,2})/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, '0')}`;
}

function labelFor(key: string): string {
  const [yearStr, monthStr] = key.split('-');
  const year = Number(yearStr);
  const monthIdx = Number(monthStr) - 1;
  const d = new Date(year, monthIdx, 1);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function buildRow(key: string, summary: Summary): MonthRow {
  const total = toNumber(pickField(summary, 'total_spend', 'totalSpend'));
  const count = toNumber(pickField(summary, 'receipt_count', 'receiptCount'));
  const updatedAt = toString_(pickField(summary, 'updated_at', 'updatedAt'));
  return { key, label: labelFor(key), total, count, updatedAt };
}

function emptyRow(year: number, month: number): MonthRow {
  const key = `${year}-${String(month).padStart(2, '0')}`;
  return {
    key,
    label: `${MONTH_NAMES[month - 1]} ${year}`,
    total: null,
    count: null,
    updatedAt: null,
  };
}

/** Build a row for every month in the given year, populated from byMonth where present. */
function buildYearRows(year: number, byMonth: Map<string, Summary>): MonthRow[] {
  const rows: MonthRow[] = [];
  for (let m = 1; m <= 12; m++) {
    const key = `${year}-${String(m).padStart(2, '0')}`;
    const summary = byMonth.get(key);
    rows.push(summary ? buildRow(key, summary) : emptyRow(year, m));
  }
  return rows;
}

/* -------------------------------------------------------------------------- */

export function MonthlySummary({ summaries }: MonthlySummaryProps) {
  const safeSummaries = Array.isArray(summaries) ? summaries : [];
  const [isFullscreen, setIsFullscreen] = useState(false);

  const byMonth = useMemo(() => {
    const map = new Map<string, Summary>();
    for (const s of safeSummaries) {
      const key = monthKeyOf(s);
      if (key) map.set(key, s);
    }
    return map;
    // We intentionally depend on the array identity from props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaries]);

  const compactRows = useMemo(
    () =>
      Array.from(byMonth.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, summary]) => buildRow(key, summary)),
    [byMonth],
  );

  // Default fullscreen year: latest year that has data, else current year.
  const latestYear = useMemo(() => {
    let max: number | null = null;
    for (const key of byMonth.keys()) {
      const y = Number(key.split('-')[0]);
      if (!Number.isNaN(y) && (max === null || y > max)) max = y;
    }
    return max ?? new Date().getFullYear();
  }, [byMonth]);

  if (compactRows.length === 0 && !isFullscreen) {
    return (
      <EmptyState
        icon={<ChartIcon />}
        title="No summary yet"
        description="Once you upload receipts, monthly totals will appear here."
        action={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ExpandIcon />}
            onClick={() => setIsFullscreen(true)}
          >
            Open calendar view
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-5 py-2">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Months with activity
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ExpandIcon />
            Expand
          </button>
        </div>
        <HeaderRow />
        <ul role="list" className="divide-y divide-border">
          {compactRows.map((row) => (
            <MonthRowItem key={row.key} row={row} />
          ))}
        </ul>
      </div>

      {isFullscreen && (
        <FullscreenSpreadsheet
          initialYear={latestYear}
          byMonth={byMonth}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */

const GRID =
  'grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)] gap-x-6 px-5';

function HeaderRow() {
  return (
    <div
      className={cn(
        GRID,
        'border-b border-border bg-muted/30 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground',
      )}
    >
      <div>Month</div>
      <div className="text-right">Total Spend</div>
      <div className="text-right">Receipts</div>
      <div className="text-right">Updated</div>
    </div>
  );
}

function MonthRowItem({ row }: { row: MonthRow }) {
  return (
    <li className={cn(GRID, 'py-3.5 text-sm')}>
      <span className="font-medium text-foreground">{row.label}</span>
      <span className="text-right font-mono tabular-nums text-foreground">
        {row.total !== null ? formatCurrency(row.total) : '—'}
      </span>
      <span className="text-right font-mono tabular-nums text-foreground">
        {row.count ?? '—'}
      </span>
      <span className="text-right text-xs text-muted-foreground">
        {row.updatedAt ? formatDate(row.updatedAt) : '—'}
      </span>
    </li>
  );
}

/* -----------------------------------------------------------------------------
 * Fullscreen calendar / spreadsheet view
 * -------------------------------------------------------------------------- */

interface FullscreenSpreadsheetProps {
  initialYear: number;
  byMonth: Map<string, Summary>;
  onClose: () => void;
}

function FullscreenSpreadsheet({
  initialYear,
  byMonth,
  onClose,
}: FullscreenSpreadsheetProps) {
  const [year, setYear] = useState(initialYear);

  // Lock background scroll + wire keyboard shortcuts (Esc to close, arrows
  // to flip years) for the lifetime of the overlay.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setYear((y) => y - 1);
      } else if (e.key === 'ArrowRight') {
        setYear((y) => y + 1);
      }
    }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const rows = useMemo(() => buildYearRows(year, byMonth), [year, byMonth]);

  const yearTotal = rows.reduce((sum, r) => sum + (r.total ?? 0), 0);
  const yearReceipts = rows.reduce((sum, r) => sum + (r.count ?? 0), 0);
  const monthsWithData = rows.filter((r) => r.total !== null || r.count !== null)
    .length;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex h-screen w-screen flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="Monthly summary calendar view"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Monthly summary
          </h2>
          <span className="text-xs text-muted-foreground">
            Calendar view — every month of the year
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<DownloadIcon />}
            onClick={() => downloadYearCsv(year, rows)}
          >
            Download CSV
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close calendar view"
          >
            <CloseIcon />
          </Button>
        </div>
      </div>

      {/* Year nav */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/20 px-6 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setYear((y) => y - 1)}
            aria-label="Previous year"
          >
            <ChevronLeftIcon />
          </Button>
          <div className="min-w-[5ch] text-center font-mono text-sm font-semibold tabular-nums text-foreground">
            {year}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setYear((y) => y + 1)}
            aria-label="Next year"
          >
            <ChevronRightIcon />
          </Button>
        </div>
        <div className="flex items-center gap-5 font-mono text-xs tabular-nums text-muted-foreground">
          <span>
            <span className="text-muted-foreground/70">Months with data:</span>{' '}
            <span className="text-foreground">{monthsWithData}/12</span>
          </span>
          <span>
            <span className="text-muted-foreground/70">Receipts:</span>{' '}
            <span className="text-foreground">{yearReceipts}</span>
          </span>
          <span>
            <span className="text-muted-foreground/70">Year total:</span>{' '}
            <span className="text-foreground">{formatCurrency(yearTotal)}</span>
          </span>
        </div>
      </div>

      {/* Spreadsheet body */}
      <div className="flex-1 overflow-auto bg-background px-6 py-6">
        <Spreadsheet rows={rows} year={year} yearTotal={yearTotal} yearReceipts={yearReceipts} />
        <p className="mt-3 text-[11px] text-muted-foreground">
          Tip: use ← / → to switch years, Esc to close.
        </p>
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */

interface SpreadsheetProps {
  rows: MonthRow[];
  year: number;
  yearTotal: number;
  yearReceipts: number;
}

function Spreadsheet({ rows, year, yearTotal, yearReceipts }: SpreadsheetProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-soft">
      <table className="w-full border-collapse font-mono text-sm">
        <colgroup>
          <col className="w-12" />
          <col />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <SpreadCell as="th" className="w-12 bg-muted/60 text-right">
              #
            </SpreadCell>
            <SpreadCell as="th" className="text-left">
              Month
            </SpreadCell>
            <SpreadCell as="th" className="text-left">
              Year
            </SpreadCell>
            <SpreadCell as="th" className="text-right">
              Total Spend
            </SpreadCell>
            <SpreadCell as="th" className="text-right">
              Receipts
            </SpreadCell>
            <SpreadCell as="th" className="text-right" last>
              Updated
            </SpreadCell>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const [yearPart, monthPart] = row.key.split('-');
            const empty = row.total === null && row.count === null;
            return (
              <tr
                key={row.key}
                className={cn(
                  'transition-colors hover:bg-muted/30',
                  empty && 'text-muted-foreground/70',
                )}
              >
                <SpreadCell className="bg-muted/30 text-right text-muted-foreground tabular-nums">
                  {idx + 1}
                </SpreadCell>
                <SpreadCell className="text-left text-foreground">
                  {MONTH_NAMES[Number(monthPart) - 1]}
                </SpreadCell>
                <SpreadCell className="text-left text-foreground tabular-nums">
                  {yearPart}
                </SpreadCell>
                <SpreadCell className="text-right tabular-nums">
                  {row.total !== null ? formatCurrency(row.total) : '—'}
                </SpreadCell>
                <SpreadCell className="text-right tabular-nums">
                  {row.count !== null ? row.count : '—'}
                </SpreadCell>
                <SpreadCell
                  className="text-right text-xs text-muted-foreground tabular-nums"
                  last
                >
                  {row.updatedAt ? formatDate(row.updatedAt) : '—'}
                </SpreadCell>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <SpreadCell as="th" className="bg-muted/60 text-right" footer>
              Σ
            </SpreadCell>
            <SpreadCell as="th" className="text-left text-foreground" footer>
              Total
            </SpreadCell>
            <SpreadCell as="th" className="text-left text-foreground tabular-nums" footer>
              {year}
            </SpreadCell>
            <SpreadCell
              as="th"
              className="text-right text-foreground tabular-nums"
              footer
            >
              {formatCurrency(yearTotal)}
            </SpreadCell>
            <SpreadCell
              as="th"
              className="text-right text-foreground tabular-nums"
              footer
            >
              {yearReceipts}
            </SpreadCell>
            <SpreadCell as="th" className="text-right" last footer>
              —
            </SpreadCell>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* A single CSV-style cell — gives every cell a right border (except the last
 * column) and a bottom border (except the footer row) for that spreadsheet feel. */
function SpreadCell({
  as: Tag = 'td',
  className,
  last,
  footer,
  children,
}: {
  as?: 'td' | 'th';
  className?: string;
  last?: boolean;
  footer?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={cn(
        'px-3 py-2 align-middle',
        !last && 'border-r border-border',
        !footer && 'border-b border-border',
        footer && 'border-t border-border',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* -----------------------------------------------------------------------------
 * CSV download
 * -------------------------------------------------------------------------- */

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadYearCsv(year: number, rows: MonthRow[]) {
  const header = ['Month', 'Year', 'Total Spend', 'Receipts', 'Updated'];
  const lines = rows.map((row) => {
    const [yearPart, monthPart] = row.key.split('-');
    return [
      MONTH_NAMES[Number(monthPart) - 1],
      yearPart,
      row.total !== null ? row.total.toFixed(2) : '',
      row.count !== null ? String(row.count) : '',
      row.updatedAt ?? '',
    ];
  });
  const csv = [header, ...lines]
    .map((cols) => cols.map((c) => csvEscape(String(c))).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipttrackerx-monthly-${year}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* -----------------------------------------------------------------------------
 * Icons
 * -------------------------------------------------------------------------- */

function ChartIcon() {
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
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
