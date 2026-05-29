import { cn } from '../../utils/cn';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Receipt mark: a small rectangular receipt silhouette with a zigzag bottom
 * edge and content lines, rendered in the current foreground/background pair
 * so it adapts cleanly to either theme.
 */
export function Logo({ className, size = 28 }: LogoProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-foreground text-background',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.62}
        height={size * 0.62}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M6 3 H18 V21 L16 19.5 L14 21 L12 19.5 L10 21 L8 19.5 L6 21 Z" />
        <path d="M9 8 H15" />
        <path d="M9 12 H15" />
        <path d="M9 16 H13" />
      </svg>
    </span>
  );
}
