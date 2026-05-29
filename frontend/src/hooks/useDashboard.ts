import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchReceipts,
  fetchSummaries,
  requestUploadUrl,
  uploadFileToBlob,
} from '../api/client';
import type { Receipt, Summary } from '../types';

interface UseDashboardOptions {
  enabled: boolean;
  getAccessToken: () => Promise<string>;
}

const POLL_INTERVAL_MS = 3_000;
const POLL_MAX_ATTEMPTS = 20;
const PROCESSING_VISIBLE_ATTEMPTS = 5;

/**
 * Owns the dashboard data lifecycle: loading receipts + summaries, uploading
 * new receipts to blob storage, and polling for updates while the backend
 * processes them. Keeps App.tsx free of effect/timer plumbing.
 */
export function useDashboard({ enabled, getAccessToken }: UseDashboardOptions) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const clearPoll = useCallback(() => {
    if (pollTimeoutRef.current !== null) {
      window.clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  /**
   * `silent` skips toggling the `loading` flag so polled fetches don't
   * cause the Refresh button to flicker between enabled/disabled.
   */
  const runRefresh = useCallback(
    async (silent: boolean) => {
      if (!enabled) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        const [receiptsData, summariesData] = await Promise.all([
          fetchReceipts(token),
          fetchSummaries(token),
        ]);
        if (!mountedRef.current) return;
        setReceipts(Array.isArray(receiptsData) ? receiptsData : []);
        setSummaries(Array.isArray(summariesData) ? summariesData : []);
      } catch (err) {
        console.error(err);
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        }
      } finally {
        if (!silent && mountedRef.current) setLoading(false);
      }
    },
    [enabled, getAccessToken],
  );

  const refresh = useCallback(() => runRefresh(false), [runRefresh]);

  const startBackgroundRefresh = useCallback(() => {
    clearPoll();
    setProcessing(true);
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      await runRefresh(true);
      if (!mountedRef.current) return;
      if (attempts >= PROCESSING_VISIBLE_ATTEMPTS) setProcessing(false);
      if (attempts < POLL_MAX_ATTEMPTS) {
        pollTimeoutRef.current = window.setTimeout(poll, POLL_INTERVAL_MS);
      }
    };
    poll();
  }, [clearPoll, runRefresh]);

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return { ok: true as const };
      setUploading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        // Each file needs its own SAS URL. Run requests + PUTs in parallel so
        // a batch of 20 doesn't serialise. allSettled lets partial successes
        // through; we still kick off polling whenever at least one succeeded.
        const results = await Promise.allSettled(
          files.map(async (file) => {
            const { uploadUrl } = await requestUploadUrl(token);
            await uploadFileToBlob(uploadUrl, file);
          }),
        );

        const failed: { name: string; reason: string }[] = [];
        let succeeded = 0;
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            succeeded += 1;
          } else {
            const reason =
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason);
            failed.push({ name: files[i].name, reason });
          }
        });

        if (succeeded > 0) startBackgroundRefresh();

        if (failed.length > 0) {
          const message =
            failed.length === files.length
              ? `Upload failed: ${failed[0].reason}`
              : `${failed.length} of ${files.length} uploads failed (${failed.map((f) => f.name).join(', ')})`;
          if (mountedRef.current) setError(message);
          return { ok: false as const, error: message, succeeded, failed };
        }

        return { ok: true as const, succeeded };
      } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'Upload failed';
        if (mountedRef.current) setError(message);
        return { ok: false as const, error: message };
      } finally {
        if (mountedRef.current) setUploading(false);
      }
    },
    [getAccessToken, startBackgroundRefresh],
  );

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) runRefresh(true);
    return () => {
      mountedRef.current = false;
      clearPoll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    receipts,
    summaries,
    loading,
    uploading,
    processing,
    error,
    refresh,
    upload,
  };
}
