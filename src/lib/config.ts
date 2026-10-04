/**
 * Public, build-time configuration. The site is a static export, so these values are inlined
 * by `next build` from NEXT_PUBLIC_* environment variables. Never put private keys here.
 */

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "https://bambookit-api.onrender.com" : "http://localhost:8080")
).replace(/\/+$/, "");

/** This website's version (package.json), inlined at build time. */
export const WEB_VERSION = process.env.NEXT_PUBLIC_WEB_VERSION || "dev";

/** Sent with every API request so the API can log which client called it. */
export const CLIENT_HEADER = { "X-BK-Client": `web/${WEB_VERSION}` } as const;

export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const SUPABASE: SupabaseConfig | null = supabaseUrl && supabaseKey ? { url: supabaseUrl, key: supabaseKey } : null;

const fbApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const fbAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
const fbProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";

/** Google sign-in is offered only when all three Firebase values are set. */
export const FIREBASE: FirebaseConfig | null =
  fbApiKey && fbAuthDomain && fbProjectId ? { apiKey: fbApiKey, authDomain: fbAuthDomain, projectId: fbProjectId } : null;

export const LINKS = {
  github: "https://github.com/BambooKit/bambookit-application",
  releases: "https://github.com/BambooKit/bambookit-application/releases/latest",
  androidReleases: "https://github.com/BambooKit/bambookit-android/releases/latest",
  discussions: "https://github.com/BambooKit/bambookit-application/discussions",
  bugReport: "https://github.com/BambooKit/bambookit-application/issues/new?template=bug_report.yml",
  featureRequest: "https://github.com/BambooKit/bambookit-application/issues/new?template=feature_request.yml",
};

export const INSTALL_COMMAND = "irm https://bambookit-web.onrender.com/install.ps1 | iex";
