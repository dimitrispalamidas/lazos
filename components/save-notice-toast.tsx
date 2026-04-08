"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

export type SaveNotice = { kind: "success" | "error"; message: string };

const AUTO_DISMISS_MS = 2000;
const MOTION_MS = 220;

type Props = {
  notice: SaveNotice | null;
  onDismiss: () => void;
};

export function SaveNoticeToast({ notice, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<{ enter?: number; auto?: number; remove?: number }>({});
  /** Avoid effect deps on `onDismiss` — parent often passes inline `() => setX(null)` and re-renders (e.g. after router.refresh()) would restart the enter animation. */
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const titleId = `${useId()}-save-notice-title`;
  const descId = `${useId()}-save-notice-desc`;

  const clearTimers = useCallback(() => {
    const t = timersRef.current;
    if (t.enter != null) window.clearTimeout(t.enter);
    if (t.auto != null) window.clearTimeout(t.auto);
    if (t.remove != null) window.clearTimeout(t.remove);
    timersRef.current = {};
  }, []);

  const closeAnimated = useCallback(() => {
    clearTimers();
    setVisible(false);
    timersRef.current.remove = window.setTimeout(() => {
      onDismissRef.current();
      timersRef.current.remove = undefined;
    }, MOTION_MS);
  }, [clearTimers]);

  useEffect(() => {
    if (!notice) {
      setVisible(false);
      return;
    }
    clearTimers();
    setVisible(false);
    timersRef.current.enter = window.setTimeout(() => {
      setVisible(true);
      timersRef.current.enter = undefined;
    }, 16);
    timersRef.current.auto = window.setTimeout(() => {
      setVisible(false);
      timersRef.current.auto = undefined;
    }, AUTO_DISMISS_MS);
    timersRef.current.remove = window.setTimeout(() => {
      onDismissRef.current();
      timersRef.current.remove = undefined;
    }, AUTO_DISMISS_MS + MOTION_MS);
    return () => clearTimers();
  }, [notice, clearTimers]);

  if (!notice) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        role={notice.kind === "error" ? "alert" : "status"}
        aria-live={notice.kind === "error" ? "assertive" : "polite"}
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={
          (notice.kind === "success"
            ? "pointer-events-auto relative w-full max-w-md rounded-2xl border border-emerald-500/40 bg-emerald-950/95 p-5 text-emerald-50 shadow-lg shadow-black/20 ring-1 ring-emerald-500/20 sm:p-6 dark:shadow-black/40 "
            : "pointer-events-auto relative w-full max-w-md rounded-2xl border border-red-500/45 bg-red-950/95 p-5 text-red-50 shadow-lg shadow-black/20 ring-1 ring-red-500/25 sm:p-6 dark:shadow-black/40 ") +
          "origin-center transform-gpu transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none " +
          (visible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-2 scale-[0.96] opacity-0")
        }
      >
        <h2 id={titleId} className="text-lg font-semibold tracking-tight">
          {notice.kind === "success" ? "Επιτυχία" : "Σφάλμα"}
        </h2>
        <p id={descId} className="mt-3 text-sm leading-relaxed text-zinc-200">
          {notice.message}
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={closeAnimated}
            className={
              notice.kind === "success"
                ? "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                : "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            }
          >
            ΟΚ
          </button>
        </div>
      </div>
    </div>
  );
}
