import { useLayoutEffect, useRef, useState } from "react";
import { Divider } from "@/components/primitives/Divider";
import { formatCurrency } from "@/lib/format";

export type SpendBasis = "share" | "total";

export interface TotalFigures {
  total: number;
  prevTotal: number;
  online: number;
}

// Total spent leads; your share is the swipe-away second view.
const SLIDES: { basis: SpendBasis; label: string }[] = [
  { basis: "total", label: "Total Spent" },
  { basis: "share", label: "My Share" },
];

interface TotalCardProps {
  share: TotalFigures;
  full: TotalFigures;
  basis: SpendBasis;
  onBasisChange: (basis: SpendBasis) => void;
  comparisonLabel: string;
}

export function TotalCard({ share, full, basis, onBasisChange, comparisonLabel }: TotalCardProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<SpendBasis>(basis);

  function scrollToBasis(target: SpendBasis, behavior: ScrollBehavior) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const index = SLIDES.findIndex((s) => s.basis === target);
    scroller.scrollTo({ left: index * scroller.clientWidth, behavior });
  }

  function basisInView(): SpendBasis | null {
    const scroller = scrollerRef.current;
    if (!scroller) return null;
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    return SLIDES[Math.min(Math.max(index, 0), SLIDES.length - 1)].basis;
  }

  // Follow the basis only when it's changed from outside the card. A change
  // that came from the user's own swipe is already in view, and jumping to it
  // here would cut the swipe short mid-gesture.
  useLayoutEffect(() => {
    if (basisInView() !== basis) scrollToBasis(basis, "auto");
  }, [basis]);

  function handleScroll() {
    const next = basisInView();
    if (!next || next === visible) return;
    setVisible(next);
    onBasisChange(next);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full border-2 border-ink">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {SLIDES.map((slide) => (
            <TotalSlide
              key={slide.basis}
              label={slide.label}
              figures={slide.basis === "share" ? share : full}
              comparisonLabel={comparisonLabel}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {SLIDES.map((slide) => (
          <button
            key={slide.basis}
            type="button"
            aria-label={`Show ${slide.label}`}
            aria-pressed={slide.basis === visible}
            onClick={() => scrollToBasis(slide.basis, "smooth")}
            className={[
              "h-2 w-2 border border-ink transition-colors",
              slide.basis === visible ? "bg-ink" : "bg-transparent",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

interface TotalSlideProps {
  label: string;
  figures: TotalFigures;
  comparisonLabel: string;
}

function TotalSlide({ label, figures, comparisonLabel }: TotalSlideProps) {
  const { total, prevTotal, online } = figures;
  const offline = total - online;
  const onlinePct = total > 0 ? Math.round((online / total) * 100) : 0;

  return (
    <div className="flex w-full shrink-0 snap-center flex-col items-center gap-1 px-4 py-4 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">{label}</p>
      <p className="text-3xl font-bold tracking-wide">{formatCurrency(Math.round(total))}</p>
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">
        {changeText(total, prevTotal)}
        {/* The rupee difference behind the %, only when there is a % to explain. */}
        {prevTotal > 0 && Math.round(total) !== Math.round(prevTotal) && (
          <>
            {" "}
            (<span className="font-bold text-ink">{formatCurrency(Math.abs(Math.round(total - prevTotal)))}</span>)
          </>
        )}{" "}
        {comparisonLabel}
      </p>
      {total > 0 && (
        <>
          <Divider weight="thin" className="my-2" />
          <div className="grid w-full grid-cols-2 text-[11px] uppercase tracking-wide text-ink-muted">
            <SplitFigure swatch="bg-online" label="Online" amount={online} pct={onlinePct} />
            <SplitFigure swatch="bg-offline" label="Offline" amount={offline} pct={100 - onlinePct} />
          </div>
        </>
      )}
    </div>
  );
}

interface SplitFigureProps {
  swatch: string;
  label: string;
  amount: number;
  pct: number;
}

function SplitFigure({ swatch, label, amount, pct }: SplitFigureProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="flex items-center gap-1">
        <span aria-hidden="true" className={`h-2 w-2 ${swatch}`} />
        {label}
      </span>
      <span>
        <span className="font-bold text-ink">{formatCurrency(Math.round(amount))}</span> · {pct}%
      </span>
    </div>
  );
}

function changeText(total: number, prevTotal: number): string {
  if (prevTotal === 0) return total === 0 ? "No change" : "▲ New";
  const pct = Math.round(((total - prevTotal) / prevTotal) * 100);
  if (pct === 0) return "= Same";
  return `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct)}%`;
}
