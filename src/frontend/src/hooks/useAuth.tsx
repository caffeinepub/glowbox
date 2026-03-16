import { Ed25519KeyIdentity } from "@dfinity/identity";
import { createContext, useContext, useEffect, useState } from "react";

const EMAIL_KEY = "focliy_last_email";

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

// Exported so AuthPage can use it to create a temporary actor for sign-in validation
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Ed25519KeyIdentity | undefined>(
    undefined,
  );
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    console.log("[Focliy] signIn: deriving identity for", normalizedEmail);
    const id = await deriveIdentity(email, password);
    setIdentity(id);
    setUserEmail(normalizedEmail);
    localStorage.setItem(EMAIL_KEY, normalizedEmail);
    console.log(
      "[Focliy] signIn: identity set, principal:",
      id.getPrincipal().toString(),
    );
  };

  const signUp = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    console.log("[Focliy] signUp: creating identity for", normalizedEmail);
    const id = await deriveIdentity(email, password);
    setIdentity(id);
    setUserEmail(normalizedEmail);
    localStorage.setItem(EMAIL_KEY, normalizedEmail);
    console.log(
      "[Focliy] signUp: identity set, principal:",
      id.getPrincipal().toString(),
    );
  };

  const signOut = () => {
    setIdentity(undefined);
    setUserEmail(undefined);
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
