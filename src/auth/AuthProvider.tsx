import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Person } from "@/data/types";

interface AuthContextValue {
  session: Session | null | undefined; // undefined = still loading
  currentUser: Person | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function deriveDisplayName(user: User): string {
  const meta = user.user_metadata ?? {};
  const raw =
    meta.given_name || meta.first_name || meta.full_name || meta.name || user.email?.split("@")[0] || "ME";
  return String(raw).split(/\s+/)[0].toUpperCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const currentUser: Person | null = session
    ? { id: session.user.id, name: deriveDisplayName(session.user), email: session.user.email }
    : null;

  const value: AuthContextValue = {
    session,
    currentUser,
    signInWithGoogle: async () => {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
