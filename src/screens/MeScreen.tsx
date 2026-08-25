import { SignOutIcon } from "@/components/icons/SignOutIcon";
import { Divider } from "@/components/primitives/Divider";
import { SolidButton } from "@/components/primitives/SolidButton";
import type { Person } from "@/data/types";

interface MeScreenProps {
  currentUser: Person;
  onLogout?: () => void;
}

export function MeScreen({ currentUser, onLogout }: MeScreenProps) {
  return (
    <div>
      <h2 className="text-center text-lg font-bold uppercase tracking-widest">Me</h2>
      <Divider className="my-3" />

      <div className="flex flex-col items-center gap-2 py-6">
        <div className="flex h-16 w-16 items-center justify-center border-2 border-ink text-2xl font-bold">
          {currentUser.name.charAt(0)}
        </div>
        <p className="text-sm font-bold uppercase tracking-wide">{currentUser.name}</p>
        {currentUser.email && <p className="text-xs text-ink-muted">{currentUser.email}</p>}
      </div>

      <Divider className="my-3" />

      <SolidButton onClick={onLogout} className="mt-4">
        <SignOutIcon className="h-4 w-4" />
        Logout
      </SolidButton>
    </div>
  );
}
