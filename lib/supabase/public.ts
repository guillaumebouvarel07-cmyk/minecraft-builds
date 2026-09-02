import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Client Supabase pour les données publiques dans des Server Components qui
 * n'ont pas besoin de session (pages publiques en lecture seule). Contrairement
 * à lib/supabase/server.ts, celui-ci n'appelle jamais cookies() — ce qui
 * évite d'opter la page en rendu entièrement dynamique et permet la
 * génération statique / ISR. Toujours la clé publique (anon) : la lecture
 * reste limitée par RLS exactement comme le client cookie-aware.
 */
export function createPublicClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
