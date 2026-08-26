import { useState } from "react";
import { ConfirmDialog } from "@/components/primitives/ConfirmDialog";
import { Divider } from "@/components/primitives/Divider";
import { EmptyState } from "@/components/primitives/EmptyState";
import { IconButton } from "@/components/primitives/IconButton";
import { ScopePill } from "@/components/primitives/ScopePill";
import { SolidButton } from "@/components/primitives/SolidButton";
import { TrashIcon } from "@/components/icons/TrashIcon";
import type { Category } from "@/data/types";

interface ScopeOption {
  key: string;
  label: string;
}

interface SettingsScreenProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  scopeLabel: string;
  scopeOptions: ScopeOption[];
  selectedScopeKey: string;
  onSelectScope: (key: string) => void;
}

export function SettingsScreen({
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  scopeLabel,
  scopeOptions,
  selectedScopeKey,
  onSelectScope,
}: SettingsScreenProps) {
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  function handleAdd() {
    if (!newName.trim()) return;
    onAddCategory(newName.trim().toUpperCase());
    setNewName("");
  }

  function confirmDelete() {
    if (deleteTarget) onDeleteCategory(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-10 bg-paper px-5 pt-6">
        <h2 className="text-center text-lg font-bold uppercase tracking-widest">Settings</h2>
        <Divider className="my-3" />
      </div>

      <div className="px-5 pb-24">
        <div className="mt-8 mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-bold uppercase tracking-wide">Categories</p>
          <ScopePill
            label={scopeLabel}
            options={scopeOptions}
            selectedKey={selectedScopeKey}
            onSelect={onSelectScope}
          />
        </div>
        <p className="mb-2 text-[11px] uppercase tracking-wide text-ink-muted">
          {selectedScopeKey === "personal" ? "Private to you" : "Shared with everyone in this group"}
        </p>
        <Divider weight="thin" className="mb-2" />

        <div className="flex flex-col">
          {categories.length === 0 && (
            <EmptyState message="No categories yet. Chaos is a valid filing system, but try again." />
          )}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
              <input
                value={cat.name}
                onChange={(e) => onRenameCategory(cat.id, e.target.value.toUpperCase())}
                className="w-full bg-transparent font-mono-receipt text-sm uppercase text-ink outline-none"
              />
              <IconButton
                label={`Delete ${cat.name}`}
                onClick={() => setDeleteTarget(cat)}
                className="text-red-600 hover:text-red-600"
              >
                <TrashIcon className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>

        <Divider className="mt-8 mb-6" />
        <p className="mb-2 text-sm font-bold uppercase tracking-wide">Add Category</p>
        <div className="flex items-center gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category"
            className="w-full border-b-2 border-ink bg-transparent px-1 py-2 font-mono-receipt text-base text-ink outline-none placeholder:text-ink-muted/60"
          />
          <SolidButton onClick={handleAdd} rounded fullWidth={false} className="px-4 py-2.5 text-sm">
            +
          </SolidButton>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message={`Remove "${deleteTarget.name}" category?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
