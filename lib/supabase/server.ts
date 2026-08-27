import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Client Supabase pour les Server Components, Server Actions et Route Handlers.
 * Utilise uniquement la clé publique (anon key), avec accès aux cookies pour
 * la future session d'authentification admin (étape 3). Pas de service_role
 * ici : les écritures admin passeront par lib/supabase/admin.ts (étape 3).
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Appelé depuis un Server Component qui ne peut pas écrire de cookies :
          // sans effet tant que le middleware (étape 3) ne rafraîchit pas la session.
        }
      },
    },
  });
}
