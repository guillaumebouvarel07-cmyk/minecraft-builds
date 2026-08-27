import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Client Supabase pour les Client Components.
 * Utilise uniquement la clé publique (anon key) : la lecture est limitée
 * par les policies RLS (mises en place à l'étape 2).
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
