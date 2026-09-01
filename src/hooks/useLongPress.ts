import { useRef, type PointerEvent as ReactPointerEvent } from "react";

interface UseLongPressOptions {
  onLongPress: () => void;
  duration?: number;
  moveThreshold?: number;
}

export function useLongPress({ onLongPress, duration = 500, moveThreshold = 10 }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const firedRef = useRef(false);

  function clear() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function onPointerDown(e: ReactPointerEvent) {
    clear();
    startPosRef.current = { x: e.clientX, y: e.clientY };
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      firedRef.current = true;
      onLongPress();
    }, duration);
  }

  function onPointerMove(e: ReactPointerEvent) {
    if (timerRef.current === null) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    if (Math.hypot(dx, dy) > moveThreshold) clear();
  }

  function consumeLongPressClick(): boolean {
    if (firedRef.current) {
      firedRef.current = false;
      return true;
    }
    return false;
  }

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: clear,
      onPointerLeave: clear,
      onPointerCancel: clear,
      onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    },
    consumeLongPressClick,
  };
}
