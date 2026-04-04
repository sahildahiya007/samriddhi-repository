import { createClient } from "@supabase/supabase-js";

/* Use Vite env variables — never hardcode secrets in source */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabaseInstance;
try {
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn("Supabase init failed:", e);
  // Create a dummy client that won't crash the app
  supabaseInstance = {
    auth: {
      signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      getUser: async () => ({ data: { user: null } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ data: [], error: null }), order: () => ({ data: [], error: null }), data: [], error: null }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: { message: "Supabase not configured" } }) }) }),
      upsert: async () => ({ data: null, error: null }),
      delete: () => ({ eq: () => ({ eq: () => ({ data: null, error: null }) }) }),
    }),
  };
}

export const supabase = supabaseInstance;
