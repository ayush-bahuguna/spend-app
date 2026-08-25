import { ActionBar } from "@/components/primitives/ActionBar";
import { SolidButton } from "@/components/primitives/SolidButton";

interface AddItemFabProps {
  onClick: () => void;
}

export function AddItemFab({ onClick }: AddItemFabProps) {
  return (
    <ActionBar>
      <SolidButton onClick={onClick} className="py-2.5 text-xs">
        <span aria-hidden="true">+</span> Add Item
      </SolidButton>
    </ActionBar>
  );
}
