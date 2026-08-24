import { Divider } from "@/components/primitives/Divider";
import { LabelValueRow } from "@/components/primitives/LabelValueRow";
import type { Person } from "@/data/types";

interface MeScreenProps {
  currentUser: Person;
  people: Person[];
}

export function MeScreen({ currentUser, people }: MeScreenProps) {
  return (
    <div>
      <h2 className="text-center text-lg font-bold uppercase tracking-widest">Me</h2>
      <Divider className="my-3" />

      <div className="flex flex-col items-center gap-2 py-4">
        <div className="flex h-16 w-16 items-center justify-center border-2 border-ink text-2xl font-bold">
          {currentUser.name.charAt(0)}
        </div>
        <p className="text-sm font-bold uppercase tracking-wide">{currentUser.name}</p>
      </div>

      <Divider className="my-3" />
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Group Members</p>
      <Divider weight="thin" className="mb-2" />
      {people.map((p) => (
        <LabelValueRow key={p.id} label={p.name} value={p.id === currentUser.id ? "You" : ""} />
      ))}
    </div>
  );
}
