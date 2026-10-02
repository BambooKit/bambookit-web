"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FIREBASE, SUPABASE } from "./config";

export type AuthStatus = "loading" | "signedIn" | "signedOut";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  provider: "email" | "google";
}

interface AuthValue {
  status: AuthStatus;
  user: AuthUser | null;
  /** Email/password sign-in is available (Supabase configured at build time). */
  emailEnabled: boolean;
  /** Google sign-in is available (Firebase configured at build time). */
  googleEnabled: boolean;
  /** True after the user opened a password-recovery link in this tab. */
  recovery: boolean;
  supabase: SupabaseClient | null;
  /** A fresh access token for the BambooKit API, or null when signed out. */
  getToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

let supabaseClient: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (!SUPABASE || typeof window === "undefined") return null;
  supabaseClient ??= createClient(SUPABASE.url, SUPABASE.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return supabaseClient;
}

type FirebaseAuthModule = typeof import("firebase/auth");
type FirebaseAuth = import("firebase/auth").Auth;
let firebasePromise: Promise<{ auth: FirebaseAuth; mod: FirebaseAuthModule }> | null = null;
function getFirebase() {
  if (!FIREBASE) return null;
  firebasePromise ??= (async () => {
    const [{ initializeApp, getApps }, mod] = await Promise.all([import("firebase/app"), import("firebase/auth")]);
    const app = getApps()[0] ?? initializeApp({ apiKey: FIREBASE!.apiKey, authDomain: FIREBASE!.authDomain, projectId: FIREBASE!.projectId });
    return { auth: mod.getAuth(app), mod };
  })();
  return firebasePromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [emailUser, setEmailUser] = useState<AuthUser | null>(null);
  const [googleUser, setGoogleUser] = useState<AuthUser | null>(null);
  const [emailReady, setEmailReady] = useState(!SUPABASE);
  const [googleReady, setGoogleReady] = useState(!FIREBASE);
  const [recovery, setRecovery] = useState(false);
  const firebaseAuth = useRef<FirebaseAuth | null>(null);

  useEffect(() => {
    const client = getSupabase();
    setSupabase(client);
    if (!client) return;
    const toUser = (u: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null | undefined): AuthUser | null =>
      u ? { id: u.id, email: u.email ?? null, name: (u.user_metadata?.name as string | undefined) ?? null, provider: "email" } : null;
    client.auth.getSession().then(({ data }) => {
      setEmailUser(toUser(data.session?.user));
      setEmailReady(true);
    });
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setEmailUser(toUser(session?.user));
      setEmailReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fb = getFirebase();
    if (!fb) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    fb.then(({ auth, mod }) => {
      if (cancelled) return;
      firebaseAuth.current = auth;
      unsubscribe = mod.onIdTokenChanged(auth, (u) => {
        setGoogleUser(u ? { id: u.uid, email: u.email, name: u.displayName, provider: "google" } : null);
        setGoogleReady(true);
      });
    }).catch(() => setGoogleReady(true));
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const user = emailUser ?? googleUser;
  const status: AuthStatus = !emailReady || !googleReady ? "loading" : user ? "signedIn" : "signedOut";

  const getToken = useCallback(async () => {
    const client = getSupabase();
    if (client) {
      const { data } = await client.auth.getSession();
      if (data.session?.access_token) return data.session.access_token;
    }
    const current = firebaseAuth.current?.currentUser;
    if (current) return current.getIdToken();
    return null;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const fb = getFirebase();
    if (!fb) throw new Error("Google sign-in is not available on this site.");
    const { auth, mod } = await fb;
    // One account at a time: leave any email session first.
    await getSupabase()?.auth.signOut();
    await mod.signInWithPopup(auth, new mod.GoogleAuthProvider());
  }, []);

  const signOut = useCallback(async () => {
    await Promise.allSettled([getSupabase()?.auth.signOut(), firebaseAuth.current?.signOut()]);
    setEmailUser(null);
    setGoogleUser(null);
    setRecovery(false);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ status, user, emailEnabled: !!SUPABASE, googleEnabled: !!FIREBASE, recovery, supabase, getToken, signInWithGoogle, signOut }),
    [status, user, recovery, supabase, getToken, signInWithGoogle, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
