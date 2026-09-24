import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatMonthLabel } from "@/lib/format";

export type RangeKey = "this-month" | "last-month" | "3m" | "6m" | "12m";

// Left to right: widest range first, so the current month sits at the right
// end of the strip and older/longer ranges are reached by scrolling left.
const ORDER: RangeKey[] = ["12m", "6m", "3m", "last-month", "this-month"];

// Wait for scroll-snap to settle before committing, so flicking past
// several options doesn't fire onChange (and a refetch) for each one.
const SETTLE_MS = 120;

function monthKeyFromNow(delta: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function rangeLabel(key: RangeKey): string {
  switch (key) {
    case "this-month":
      return formatMonthLabel(monthKeyFromNow(0));
    case "last-month":
      return formatMonthLabel(monthKeyFromNow(-1));
    case "3m":
      return "3 Months";
    case "6m":
      return "6 Months";
    case "12m":
      return "12 Months";
  }
}

interface RangeSelectorProps {
  value: RangeKey;
  onChange: (key: RangeKey) => void;
}

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Partial<Record<RangeKey, HTMLButtonElement | null>>>({});
  const settleTimer = useRef<number | undefined>(undefined);
  const lastValue = useRef<RangeKey | null>(null);
  const [centered, setCentered] = useState<RangeKey>(value);

  function scrollToKey(key: RangeKey, behavior: ScrollBehavior) {
    const scroller = scrollerRef.current;
    const item = itemRefs.current[key];
    if (!scroller || !item) return;
    scroller.scrollTo({
      left: item.offsetLeft + item.offsetWidth / 2 - scroller.clientWidth / 2,
      behavior,
    });
  }

  // Centre the selected option on first paint (no animation), and animate to
  // it whenever the value is changed from outside.
  useLayoutEffect(() => {
    const isChange = lastValue.current !== null && lastValue.current !== value;
    scrollToKey(value, isChange ? "smooth" : "auto");
    lastValue.current = value;
  }, [value]);

  // JetBrains Mono swaps in after first paint (font-display: swap) and changes
  // every label's width, which leaves the selection off-centre — re-centre
  // once fonts are ready, and whenever the viewport resizes.
  useEffect(() => {
    let cancelled = false;
    const recentre = () => {
      if (!cancelled) scrollToKey(value, "auto");
    };
    document.fonts.ready.then(recentre);
    window.addEventListener("resize", recentre);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", recentre);
    };
  }, [value]);

  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const middle = scroller.scrollLeft + scroller.clientWidth / 2;

    let closest = value;
    let bestDistance = Infinity;
    for (const key of ORDER) {
      const item = itemRefs.current[key];
      if (!item) continue;
      const distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle);
      if (distance < bestDistance) {
        bestDistance = distance;
        closest = key;
      }
    }

    setCentered(closest);
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      if (closest !== value) onChange(closest);
    }, SETTLE_MS);
  }

  return (
    <div
      ref={scrollerRef}
      onScroll={handleScroll}
      className="no-scrollbar relative -mx-5 flex snap-x snap-mandatory items-center overflow-x-auto py-1"
    >
      <div aria-hidden="true" className="w-1/2 shrink-0" />
      {ORDER.map((key) => {
        const isActive = key === centered;
        return (
          <button
            key={key}
            ref={(el) => {
              itemRefs.current[key] = el;
            }}
            type="button"
            onClick={() => scrollToKey(key, "smooth")}
            aria-pressed={key === value}
            className={[
              "shrink-0 snap-center whitespace-nowrap px-3 py-1.5 uppercase tracking-widest transition-all duration-200",
              isActive ? "text-sm font-bold text-ink" : "text-xs text-ink-muted/40",
            ].join(" ")}
          >
            {rangeLabel(key)}
          </button>
        );
      })}
      <div aria-hidden="true" className="w-1/2 shrink-0" />
    </div>
  );
}
