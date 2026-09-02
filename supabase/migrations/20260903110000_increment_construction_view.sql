-- Étape 16 : compteur de vues (constructions.view_count).
--
-- GA4 donne déjà une vue riche (tendances, référents, sessions...) via
-- construction_view, mais reste invisible pour un visiteur avec un
-- bloqueur de pub/traqueurs — fréquent chez un public averti. Le compteur
-- DB est un signal plus modeste mais garanti, et permet un futur tri
-- "les plus consultées" côté serveur sans passer par l'API de reporting
-- GA4 (auth OAuth/service account, hors scope MVP).
--
-- SECURITY DEFINER est nécessaire ici : un visiteur anonyme n'a (et ne
-- doit pas avoir) de droit UPDATE direct sur constructions. La fonction
-- s'exécute donc avec les droits du propriétaire pour pouvoir écrire,
-- mais son corps ne permet STRICTEMENT rien d'autre qu'un +1 sur
-- view_count d'une ligne publiée précise :
--   - un seul paramètre (le slug) : impossible de fournir une valeur de
--     compteur, seulement d'identifier QUELLE ligne ;
--   - l'opération elle-même (+1) est codée en dur dans le SQL, jamais
--     paramétrable ;
--   - aucune autre colonne n'est touchée ;
--   - "and status = 'publie'" exclut les brouillons : appeler cette
--     fonction avec le slug d'un brouillon ne fait rien (0 ligne
--     affectée), jamais d'accès à son contenu ni à son compteur ;
--   - "set search_path = public" évite le détournement de search_path,
--     la faille classique des fonctions SECURITY DEFINER Postgres.
--
-- Anti-fraude : volontairement absent ici (voir le déduplicatage
-- sessionStorage côté client dans ConstructionViewTracker) — le MVP n'a
-- pas besoin d'un compteur infalsifiable, seulement qu'un visiteur ne
-- puisse pas écrire une valeur arbitraire.
create or replace function increment_construction_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update constructions
  set view_count = view_count + 1
  where slug = p_slug and status = 'publie';
$$;

revoke all on function increment_construction_view(text) from public;
grant execute on function increment_construction_view(text) to anon, authenticated;
