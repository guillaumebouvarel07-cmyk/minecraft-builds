import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Retourne l'utilisateur connecté UNIQUEMENT s'il s'agit du compte
 * administrateur (email === ADMIN_EMAIL). Une session Supabase valide
 * ne suffit pas : n'importe quel compte créé dans le projet Supabase
 * échouerait ici s'il ne correspond pas à ADMIN_EMAIL.
 *
 * `getUser()` revalide le token auprès de Supabase (contrairement à
 * `getSession()` qui fait confiance au cookie) : c'est la vérification
 * qui compte réellement, indépendamment de ce qu'a déjà filtré le middleware.
 *
 * `cache()` déduplique les appels au sein d'un même rendu (layout + page
 * appellent tous deux cette fonction sans déclencher deux requêtes réseau).
 */
export const getAdminUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  if (data.user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }

  return data.user;
});
