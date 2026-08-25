import { useState } from "react";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { ConfirmDialog } from "@/components/primitives/ConfirmDialog";
import { Divider } from "@/components/primitives/Divider";
import { IconButton } from "@/components/primitives/IconButton";
import { SolidButton } from "@/components/primitives/SolidButton";
import type { Group } from "@/data/api/groups";

interface GroupsScreenProps {
  groups: Group[];
  onSelectGroup: (group: Group) => void;
  onCreateGroup: (name: string) => Promise<void>;
  onJoinGroup: (code: string) => Promise<{ ok: boolean; error?: string }>;
  onLeaveGroup: (groupId: string) => void;
}

export function GroupsScreen({
  groups,
  onSelectGroup,
  onCreateGroup,
  onJoinGroup,
  onLeaveGroup,
}: GroupsScreenProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  async function handleCreate() {
    if (!newGroupName.trim()) return;
    await onCreateGroup(newGroupName.trim());
    setNewGroupName("");
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    const result = await onJoinGroup(joinCode.trim());
    if (result.ok) {
      setJoinCode("");
      setJoinError(undefined);
    } else {
      setJoinError(result.error ?? "INVALID CODE");
    }
  }

  function confirmLeave() {
    if (deleteTarget) onLeaveGroup(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-10 bg-paper px-5 pt-6">
        <h2 className="text-center text-lg font-bold uppercase tracking-widest">Groups</h2>
        <Divider className="my-3" />
      </div>

      <div className="px-5 pb-24">
        <p className="mt-8 mb-2 text-sm font-bold uppercase tracking-wide">Your Groups</p>
        <Divider weight="thin" className="mb-2" />

        <div className="flex flex-col">
          {groups.length === 0 && (
            <p className="py-3 text-center text-xs uppercase tracking-wide text-ink-muted">
              No groups yet
            </p>
          )}
          {groups.map((group) => (
            <div key={group.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <button type="button" onClick={() => onSelectGroup(group)} className="flex-1 text-left">
                <span className="block uppercase text-ink">{group.name}</span>
                <span className="block text-[11px] text-ink-muted">Code: {group.joinCode}</span>
              </button>
              <IconButton
                label={`Leave ${group.name}`}
                onClick={() => setDeleteTarget(group)}
                className="text-red-600 hover:text-red-600"
              >
                <TrashIcon className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>

        <Divider className="mt-8 mb-6" />
        <p className="mb-2 text-sm font-bold uppercase tracking-wide">Create Group</p>
        <div className="flex items-center gap-3">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            className="w-full border-b-2 border-ink bg-transparent px-1 py-2 font-mono-receipt text-base text-ink outline-none placeholder:text-ink-muted/60"
          />
          <SolidButton onClick={handleCreate} rounded fullWidth={false} className="px-4 py-2.5 text-sm">
            +
          </SolidButton>
        </div>

        <Divider className="mt-8 mb-6" />
        <p className="mb-2 text-sm font-bold uppercase tracking-wide">Join Group</p>
        <div className="flex items-center gap-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Code"
            maxLength={6}
            className="w-full border-b-2 border-ink bg-transparent px-1 py-2 font-mono-receipt text-base uppercase tracking-[0.3em] text-ink outline-none placeholder:text-ink-muted/60 placeholder:tracking-normal"
          />
          <SolidButton onClick={handleJoin} rounded fullWidth={false} className="px-4 py-2.5 text-sm">
            Join
          </SolidButton>
        </div>
        {joinError && <p className="mt-1 text-xs font-bold text-ink">{joinError}</p>}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message={`Leave "${deleteTarget.name}"?`}
          onConfirm={confirmLeave}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
