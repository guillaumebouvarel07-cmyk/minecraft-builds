import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Rafraîchit la session Supabase à chaque requête (cookies httpOnly gérés
 * par @supabase/ssr) et protège /admin/* (sauf /admin/login).
 *
 * `supabase.auth.getUser()` est utilisé plutôt que `getSession()` : il
 * revalide le token auprès du serveur Supabase au lieu de faire confiance
 * au cookie tel quel, ce qui est la méthode recommandée côté serveur.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isProtectedAdminRoute) {
    const isAdmin = !!user && user.email === process.env.ADMIN_EMAIL;
    if (!isAdmin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}
