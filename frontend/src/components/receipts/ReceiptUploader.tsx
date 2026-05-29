import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface ReceiptUploaderProps {
  uploading: boolean;
  onUpload: (files: File[]) => void | Promise<unknown>;
}

const ACCEPTED = '.jpg,.jpeg,.png,.pdf';
const MAX_FILES = 20;

interface PendingFile {
  id: string;
  file: File;
}

function makeId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReceiptUploader({ uploading, onUpload }: ReceiptUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const openPicker = () => inputRef.current?.click();

  // Merge new files with what's already queued, de-duped by name+size+mtime,
  // and capped at MAX_FILES. Surfaces a friendly warning when we truncate.
  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const list = Array.from(incoming);
    if (list.length === 0) return;

    setPending((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const additions: PendingFile[] = [];
      for (const file of list) {
        const id = makeId(file);
        if (existingIds.has(id)) continue;
        existingIds.add(id);
        additions.push({ id, file });
      }

      const remaining = MAX_FILES - prev.length;
      const accepted = additions.slice(0, Math.max(0, remaining));
      const dropped = additions.length - accepted.length;

      if (dropped > 0) {
        setWarning(
          `You can upload up to ${MAX_FILES} files at once. ${dropped} ${dropped === 1 ? 'file was' : 'files were'} skipped.`,
        );
      } else {
        setWarning(null);
      }

      return prev.concat(accepted);
    });
  };

  const removeAt = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    setWarning(null);
  };

  const clearAll = () => {
    setPending([]);
    setWarning(null);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    addFiles(event.dataTransfer.files);
  };

  const submit = async () => {
    if (pending.length === 0) return;
    await onUpload(pending.map((p) => p.file));
    setPending([]);
    setWarning(null);
  };

  const count = pending.length;
  const remaining = MAX_FILES - count;
  const totalBytes = useMemo(
    () => pending.reduce((sum, p) => sum + p.file.size, 0),
    [pending],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed bg-surface px-6 py-10 text-center transition-colors',
        dragOver ? 'border-foreground/40 bg-muted/40' : 'border-border',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UploadIcon />
      </div>

      <h3 className="mt-3 text-sm font-medium text-foreground">
        {count === 0
          ? 'Upload receipts'
          : `${count} ${count === 1 ? 'file' : 'files'} ready`}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {count === 0
          ? `Drag and drop or browse. PNG, JPG, or PDF. Up to ${MAX_FILES} at once.`
          : `${formatSize(totalBytes)} total — ${remaining} more slot${remaining === 1 ? '' : 's'} available`}
      </p>

      {count > 0 && (
        <ul className="mt-4 w-full max-w-md space-y-1 text-left">
          {pending.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {p.file.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatSize(p.file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeAt(p.id)}
                disabled={uploading}
                aria-label={`Remove ${p.file.name}`}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {warning && (
        <p className="mt-3 text-xs text-muted-foreground">{warning}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={openPicker}
          disabled={uploading || remaining <= 0}
        >
          {count === 0 ? 'Choose files' : 'Add more'}
        </Button>
        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={uploading}
          >
            Clear
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={submit}
          loading={uploading}
          disabled={count === 0 || uploading}
        >
          {uploading
            ? 'Uploading'
            : count <= 1
              ? 'Upload'
              : `Upload ${count} files`}
        </Button>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CloseIcon() {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
