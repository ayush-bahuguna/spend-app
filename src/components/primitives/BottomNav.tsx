import {
  CoinsFillIcon,
  CoinsIcon,
  GearSixFillIcon,
  GearSixIcon,
  GridFourFillIcon,
  GridFourIcon,
  ListDashesFillIcon,
  ListDashesIcon,
  UserFillIcon,
  UserIcon,
} from "@/components/icons/NavIcons";
import type { ComponentType, SVGProps } from "react";

export type NavSection = "expenses" | "history" | "groups" | "settings" | "me";

interface BottomNavProps {
  active: NavSection;
  onChange: (section: NavSection) => void;
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const TABS: { key: NavSection; label: string; icon: IconComponent; iconFilled: IconComponent }[] = [
  { key: "expenses", label: "Expenses", icon: CoinsIcon, iconFilled: CoinsFillIcon },
  { key: "history", label: "History", icon: ListDashesIcon, iconFilled: ListDashesFillIcon },
  { key: "groups", label: "Groups", icon: GridFourIcon, iconFilled: GridFourFillIcon },
  { key: "settings", label: "Settings", icon: GearSixIcon, iconFilled: GearSixFillIcon },
  { key: "me", label: "Me", icon: UserIcon, iconFilled: UserFillIcon },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="flex border-t-2 border-ink bg-paper pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const TabIcon = isActive ? tab.iconFilled : tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="flex flex-1 items-stretch justify-center py-3"
          >
            <span
              className={[
                "mx-1.5 flex w-full flex-col items-center justify-center gap-1 rounded-xl py-2",
                "font-mono-receipt text-xs font-bold uppercase tracking-wide",
                isActive ? "bg-paper-alt/50 text-ink" : "text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              <TabIcon className="h-5 w-5" />
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
