import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Client Supabase avec la clé service_role : contourne RLS entièrement.
 *
 * IMPORTANT : ce fichier ne doit jamais être importé depuis un Client
 * Component ni depuis quoi que ce soit qui finit dans le bundle navigateur.
 * À n'utiliser que dans des Server Actions/Route Handlers, et seulement
 * après avoir vérifié `getAdminUser()` — cette clé n'effectue elle-même
 * aucun contrôle d'accès.
 */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
