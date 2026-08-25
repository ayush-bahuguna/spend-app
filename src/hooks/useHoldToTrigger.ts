import { useRef, type PointerEvent as ReactPointerEvent } from "react";

interface UseHoldToTriggerOptions {
  duration?: number;
  onStart?: () => void;
  /** Called every animation frame while held, with progress in [0, 1]. Called
   * once with 0 when the hold is released/cancelled before completing. */
  onProgress?: (progress: number) => void;
  onComplete: () => void;
}

export function useHoldToTrigger({
  duration = 5000,
  onStart,
  onProgress,
  onComplete,
}: UseHoldToTriggerOptions) {
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  function stopLoop() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      onProgress?.(0);
    }
  }

  function tick(now: number) {
    const progress = Math.min((now - startTimeRef.current) / duration, 1);
    onProgress?.(progress);
    if (progress >= 1) {
      rafRef.current = null;
      onComplete();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function start(e: ReactPointerEvent) {
    stopLoop();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore — unsupported or invalid pointerId
    }
    onStart?.();
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }

  function release(e: ReactPointerEvent) {
    stopLoop();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  return {
    onPointerDown: start,
    onPointerUp: release,
    onPointerLeave: release,
    onPointerCancel: release,
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
  };
}
