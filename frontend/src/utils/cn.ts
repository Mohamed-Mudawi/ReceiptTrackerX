type ClassValue = string | number | null | undefined | false | ClassValue[];

/**
 * Tiny `classnames`/`clsx` replacement. Concatenates truthy class names and
 * flattens nested arrays so callers can compose conditional class strings
 * without pulling in an extra dependency.
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }
  return out.join(' ');
}
