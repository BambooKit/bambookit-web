import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://skvjitpcpwfprgxvnpdd.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_NVa-m7IgTI-ez-2uEKkZJw_f3MwBIyv";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );
