interface TicketStubProps {
  label: string;
  amount: string;
  selected?: boolean;
  onClick?: () => void;
}

export function TicketStub({ label, amount, selected = false, onClick }: TicketStubProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "receipt-grain block w-full overflow-hidden rounded-xl px-2 py-4 text-center",
        selected ? "bg-paper-alt/50" : "bg-paper-alt/20",
      ].join(" ")}
    >
      <div className="relative z-[2] flex flex-col items-center gap-1">
        <span className="text-[11px] uppercase tracking-wide text-ink">{label}</span>
        <span className="text-sm font-bold tabular-nums text-ink">{amount}</span>
      </div>
    </button>
  );
}
