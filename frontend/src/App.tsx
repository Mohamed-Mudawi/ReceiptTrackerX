import { Header } from './components/layout/Header';
import { SignInScreen } from './components/layout/SignInScreen';
import { ReceiptList } from './components/receipts/ReceiptList';
import { ReceiptUploader } from './components/receipts/ReceiptUploader';
import { MonthlySummary } from './components/summary/MonthlySummary';
import { Button } from './components/ui/Button';
import { Spinner } from './components/ui/Spinner';
import { useAuth } from './hooks/useAuth';
import { useDashboard } from './hooks/useDashboard';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { isAuthenticated, displayName, login, logout, getAccessToken } = useAuth();

  const {
    receipts,
    summaries,
    loading,
    uploading,
    processing,
    error,
    refresh,
    upload,
  } = useDashboard({ enabled: isAuthenticated, getAccessToken });

  // Only show the Refresh button's pressed/spinning state when the user
  // actually clicked it — never while an upload or background poll is running.
  const userRefreshing = loading && !uploading && !processing;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        username={displayName}
        rightSlot={
          isAuthenticated && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={refresh}
                disabled={userRefreshing}
                leftIcon={<RefreshIcon spinning={userRefreshing} />}
              >
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          )
        }
      />

      {!isAuthenticated ? (
        <SignInScreen onSignIn={login} />
      ) : (
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <section className="animate-fade-in">
            <SectionHeader
              title="Monthly summary"
              description="Spending and receipt counts by month."
            />
            <MonthlySummary summaries={summaries} />
          </section>

          <section className="mt-10 animate-fade-in">
            <SectionHeader
              title="Upload"
              description="Drop a receipt to extract its details automatically."
            />
            <ReceiptUploader uploading={uploading} onUpload={upload} />
            {processing && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
                <Spinner size={14} />
                <span>Processing</span>
              </div>
            )}
            {error && (
              <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                {error}
              </div>
            )}
          </section>

          <section className="mt-10 animate-fade-in">
            <SectionHeader
              title="Receipts"
              description="Everything you've uploaded, newest first."
              right={
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {receipts.length} total
                </span>
              }
            />
            <ReceiptList receipts={receipts} />
          </section>
        </main>
      )}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  right?: React.ReactNode;
}

function SectionHeader({ title, description, right }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {right}
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
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
      className={spinning ? 'animate-spin' : undefined}
      aria-hidden
    >
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
