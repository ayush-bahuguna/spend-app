import { useRef } from "react";

interface UseLongPressOptions {
  onStart?: () => void;
  onLongPress: () => void;
  delay?: number;
}

export function useLongPress({ onStart, onLongPress, delay = 5000 }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    clear();
    onStart?.();
    timerRef.current = setTimeout(onLongPress, delay);
  }

  function clear() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
  };
}
