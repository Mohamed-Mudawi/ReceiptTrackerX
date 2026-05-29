import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

interface SignInScreenProps {
  onSignIn: () => void;
}

export function SignInScreen({ onSignIn }: SignInScreenProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />
      <div className="relative w-full max-w-md animate-fade-in rounded-2xl border border-border bg-surface p-8 shadow-elevated">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              ReceiptTrackerX
            </h1>
            <p className="text-xs text-muted-foreground">
              Snap, store, and summarize every receipt.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Sign in to continue
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Upload a photo or PDF of a receipt and we'll pull the merchant,
            total, and category automatically.
          </p>
        </div>

        <div className="mt-7">
          <Button onClick={onSignIn} className="w-full" leftIcon={<MicrosoftIcon />}>
            Sign in with Microsoft
          </Button>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Your account is used only for authentication.
          </p>
        </div>
      </div>
    </div>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 23 23" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}
