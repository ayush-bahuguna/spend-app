import type { ReactNode } from "react";
import { Divider } from "@/components/primitives/Divider";

interface AnalyticsSectionProps {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

export function AnalyticsSection({ title, aside, children }: AnalyticsSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-widest">{title}</h3>
        {aside && <div className="text-[11px] uppercase tracking-wide text-ink-muted">{aside}</div>}
      </div>
      <Divider weight="thin" />
      {children}
    </section>
  );
}

// A section with nothing to plot while the rest of the screen has data.
// (When the whole selection is empty, the screen shows EmptyState instead.)
export function AnalyticsSectionEmpty({ message }: { message: string }) {
  return <p className="py-2 text-center text-xs uppercase tracking-wide text-ink-muted">{message}</p>;
}
