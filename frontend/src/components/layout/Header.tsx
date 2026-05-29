import type { ReactNode } from 'react';
import type { Theme } from '../../types';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  rightSlot?: ReactNode;
  username?: string;
}

export function Header({ theme, onToggleTheme, rightSlot, username }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              ReceiptTrackerX
            </span>
            {username && (
              <span className="text-[11px] text-muted-foreground">
                {username}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rightSlot}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
