import type { ReactNode } from "react";

interface ActionBarProps {
  children: ReactNode;
}

export function ActionBar({ children }: ActionBarProps) {
  return <div className="border-t-2 border-ink bg-paper px-5 py-4">{children}</div>;
}
