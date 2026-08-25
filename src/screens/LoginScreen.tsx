import { useAuth } from "@/auth/AuthProvider";
import { Divider } from "@/components/primitives/Divider";
import { ReceiptPaper } from "@/components/primitives/ReceiptPaper";
import { SolidButton } from "@/components/primitives/SolidButton";

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();

  return (
    <ReceiptPaper>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
        <h1 className="text-3xl font-bold tracking-[0.2em]">SPEND</h1>
        <Divider className="w-full" />
        <p className="text-center text-xs uppercase tracking-wide text-ink-muted">
          Sign in to sync your receipts
        </p>
        <SolidButton onClick={signInWithGoogle}>Sign in with Google</SolidButton>
      </div>
    </ReceiptPaper>
  );
}
