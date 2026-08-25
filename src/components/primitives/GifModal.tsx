import { IconButton } from "@/components/primitives/IconButton";

interface GifModalProps {
  gifUrl: string;
  onClose: () => void;
}

export function GifModal({ gifUrl, onClose }: GifModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-8">
      <div className="w-full max-w-[23.75rem] px-6 sm:max-w-[26.875rem]">
        <div className="relative">
          <IconButton
            label="Close"
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 border-2 border-ink bg-paper"
          >
            ✕
          </IconButton>
          <img src={gifUrl} alt="" className="w-full rounded-xl border-2 border-ink" />
        </div>
      </div>
    </div>
  );
}
