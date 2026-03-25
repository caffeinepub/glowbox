import { Ed25519KeyIdentity } from "@dfinity/identity";
import { createContext, useContext, useEffect, useState } from "react";

const EMAIL_KEY = "focliy_last_email";
const SEED_KEY = "focliy_identity_seed"; // base64-encoded 32-byte seed for session persistence

type AuthState = {
  identity: Ed25519KeyIdentity | undefined;
  userEmail: string | undefined;
  isAuthenticated: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export async function deriveIdentity(
  email: string,
  password: string,
): Promise<Ed25519KeyIdentity> {
  const raw = `${email.toLowerCase().trim()}:${password}`;
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  return Ed25519KeyIdentity.generate(new Uint8Array(buf));
}

async function deriveSeedBytes(
  email: string,
  password: string,
): Promise<Uint8Array> {
  const raw = `${email.toLowerCase().trim()}:${password}`;
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  return new Uint8Array(buf);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Ed25519KeyIdentity | undefined>(
    undefined,
  );
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore session from localStorage on mount -- user stays logged in until explicit sign out
  useEffect(() => {
    const storedEmail = localStorage.getItem(EMAIL_KEY);
    const storedSeed = localStorage.getItem(SEED_KEY);
    if (storedEmail && storedSeed) {
      try {
        const seedBytes = Uint8Array.from(atob(storedSeed), (c) =>
          c.charCodeAt(0),
        );
        const id = Ed25519KeyIdentity.generate(seedBytes);
        setIdentity(id);
        setUserEmail(storedEmail);
        console.log("[Focliy] Session restored for:", storedEmail);
      } catch (_e) {
        console.warn("[Focliy] Failed to restore session, clearing storage");
        localStorage.removeItem(EMAIL_KEY);
        localStorage.removeItem(SEED_KEY);
      }
    }
    setIsInitializing(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    console.log("[Focliy] signIn: deriving identity for", normalizedEmail);
    const seedBytes = await deriveSeedBytes(normalizedEmail, password);
    const id = Ed25519KeyIdentity.generate(seedBytes);
    setIdentity(id);
    setUserEmail(normalizedEmail);
    localStorage.setItem(EMAIL_KEY, normalizedEmail);
    const seedBase64 = btoa(String.fromCharCode(...Array.from(seedBytes)));
    localStorage.setItem(SEED_KEY, seedBase64);
    console.log(
      "[Focliy] signIn: identity set, principal:",
      id.getPrincipal().toString(),
    );
  };

  const signUp = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    console.log("[Focliy] signUp: creating identity for", normalizedEmail);
    const seedBytes = await deriveSeedBytes(normalizedEmail, password);
    const id = Ed25519KeyIdentity.generate(seedBytes);
    setIdentity(id);
    setUserEmail(normalizedEmail);
    localStorage.setItem(EMAIL_KEY, normalizedEmail);
    const seedBase64 = btoa(String.fromCharCode(...Array.from(seedBytes)));
    localStorage.setItem(SEED_KEY, seedBase64);
    console.log(
      "[Focliy] signUp: identity set, principal:",
      id.getPrincipal().toString(),
    );
  };

  const signOut = () => {
    setIdentity(undefined);
    setUserEmail(undefined);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(SEED_KEY);
    console.log("[Focliy] Signed out");
  };

  return (
    <AuthContext.Provider
      value={{
        identity,
        userEmail,
        isAuthenticated: !!identity,
        isInitializing,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
