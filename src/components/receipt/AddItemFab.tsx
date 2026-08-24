import { SolidButton } from "@/components/primitives/SolidButton";

interface AddItemFabProps {
  onClick: () => void;
}

export function AddItemFab({ onClick }: AddItemFabProps) {
  return (
    <div className="border-t-2 border-ink bg-paper px-5 py-4">
      <SolidButton onClick={onClick} rounded className="py-2.5 text-xs">
        <span aria-hidden="true">+</span> Add Item
      </SolidButton>
    </div>
  );
}
