import { Ed25519KeyIdentity } from "@dfinity/identity";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "focliy_auth";

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

async function deriveIdentity(
  email: string,
  password: string,
): Promise<Ed25519KeyIdentity> {
  const raw = `${email.toLowerCase().trim()}:${password}`;
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  const seed = new Uint8Array(buf);
  return Ed25519KeyIdentity.generate(seed);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Ed25519KeyIdentity | undefined>(
    undefined,
  );
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const restored = Ed25519KeyIdentity.fromJSON(JSON.parse(parsed.key));
        setIdentity(restored);
        setUserEmail(parsed.email);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      throw new Error("Account not found");
    }
    const parsed = JSON.parse(stored);
    if (parsed.email !== email.toLowerCase().trim()) {
      throw new Error("Invalid credentials");
    }
    const id = await deriveIdentity(email, password);
    const storedPrincipal = Ed25519KeyIdentity.fromJSON(JSON.parse(parsed.key))
      .getPrincipal()
      .toString();
    if (id.getPrincipal().toString() !== storedPrincipal) {
      throw new Error("Invalid credentials");
    }
    setIdentity(id);
    setUserEmail(parsed.email);
  };

  const signUp = async (email: string, password: string) => {
    const id = await deriveIdentity(email, password);
    const normalized = email.toLowerCase().trim();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ email: normalized, key: JSON.stringify(id.toJSON()) }),
    );
    setIdentity(id);
    setUserEmail(normalized);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIdentity(undefined);
    setUserEmail(undefined);
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
