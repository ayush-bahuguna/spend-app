import { useRef } from "react";

interface UseTripleTapOptions {
  taps?: number;
  resetAfterMs?: number;
}

export function useTripleTap(onComplete: () => void, options?: UseTripleTapOptions) {
  const requiredTaps = options?.taps ?? 3;
  const resetAfterMs = options?.resetAfterMs ?? 600;
  const countRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onClick() {
    countRef.current += 1;
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    if (countRef.current >= requiredTaps) {
      countRef.current = 0;
      onComplete();
      return;
    }

    resetTimerRef.current = setTimeout(() => {
      countRef.current = 0;
    }, resetAfterMs);
  }

  return { onClick };
}
