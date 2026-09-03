# Checklist de lancement production — Blokprint

Établie à l'étape 22 (audit de préparation au déploiement). Chaque case
reflète l'état réel constaté à cette date, pas un objectif générique —
revérifier avant le lancement effectif si du temps s'est écoulé.

## Domaine et hébergement

- [ ] Domaine réel choisi et communiqué
- [ ] Domaine connecté au projet Vercel
- [ ] Version canonique choisie (`https://domaine.tld` ou `https://www.domaine.tld`) et l'autre redirigée
- [ ] DNS configurés selon les valeurs exactes données par Vercel (jamais des valeurs génériques)
- [ ] Certificat HTTPS actif sur le domaine
- [ ] Redirection HTTP → HTTPS vérifiée
- [ ] Aucun mixed content

## Variables d'environnement (Vercel → Production)

- [ ] `NEXT_PUBLIC_SITE_URL` = URL canonique réelle (jamais `localhost`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement — jamais préfixée `NEXT_PUBLIC_`)
- [ ] `ADMIN_EMAIL`
- [ ] `GOOGLE_SITE_VERIFICATION` (si Search Console déjà configuré)
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optionnel — le site fonctionne sans)
- [ ] Les mêmes variables (sauf `SUPABASE_SERVICE_ROLE_KEY`, à garder identique) sont cohérentes en Preview

## Supabase production

- [x] Projet unique confirmé (`ywnnmkvtpffrwzshorms.supabase.co`), pas de projet de test séparé
- [x] Les 8 tables attendues existent et sont interrogeables
- [x] RLS empêche l'écriture/suppression anonyme (vérifié : `UPDATE`/`DELETE` anon → 0 ligne affectée)
- [x] RLS masque les constructions brouillon à l'anon, expose les publiées
- [x] Bucket `construction-files` privé (accès direct → 400, pas 200)
- [x] Bucket `construction-images` et `material-icons` publics (attendu, contenu non sensible)
- [x] Inscription publique désactivée (`Signups not allowed for this instance`)
- [ ] Migrations : pas de suivi CLI (`supabase_migrations` absent — migrations appliquées manuellement) ; à confirmer une dernière fois par relecture manuelle des 17 fichiers avant lancement si un doute subsiste

## Données

- [x] Chalet du Voyageur = `publie` / `verified`
- [x] 15 constructions demo = `publie` / `demo`
- [x] `maison-deepslate` = `brouillon` / `demo`
- [x] Catalogue matériaux = 790, icônes = 790/790
- [x] `download_count` du Chalet du Voyageur = 0 (restauré après tests de cette étape)
- [ ] Dernière relecture du contenu texte (description, alt text) avant mise en avant publique

## Admin

- [x] `/admin/login` répond, redirige les routes protégées vers la connexion
- [x] Aucun bandeau cookies, aucun script GA sur `/admin/*`
- [x] `noindex, nofollow` sur tout `/admin/*`
- [ ] Compte `ADMIN_EMAIL` de production confirmé actif dans Supabase Auth

## Informations légales

- [ ] **BLOQUANT** — nom/raison sociale de l'éditeur
- [ ] **BLOQUANT** — statut juridique
- [ ] **BLOQUANT** — adresse à afficher légalement
- [ ] SIRET (si applicable)
- [ ] **BLOQUANT** — email de contact réel (actuellement un placeholder sur `/contact` et `/mentions-legales`)
- [ ] Directeur de publication
- [ ] `lib/legal.ts` mis à jour avec les vraies valeurs

## Consentement / GA4

- [x] Aucun chargement GA4 avant consentement (vérifié en local)
- [x] Bandeau Accepter/Refuser à parité, testé
- [x] `/admin` toujours sans bandeau ni GA
- [x] `VERCEL_ENV !== "production"` empêche GA4 sur Preview même avec un ID configuré
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` réel configuré (optionnel — pas un blocker de lancement)
- [ ] Test réel sur le domaine de production une fois en ligne

## Search Console

- [ ] Propriété ajoutée (méthode et URL précisées dans le rapport de l'étape 22)
- [ ] `GOOGLE_SITE_VERIFICATION` renseignée si vérification par balise meta choisie
- [ ] Sitemap soumis (`/sitemap.xml`)

## SEO technique

- [x] `robots.txt` correct en local (règles admin/recherche, référence au sitemap)
- [x] `sitemap.xml` ne contient que le contenu indexable réel (homepage, `/a-propos`, Chalet du Voyageur, catégorie(s) verified)
- [x] Aucune des 15 demos dans le sitemap
- [x] Tags sous le seuil (< 2 verified) absents du sitemap
- [ ] Revérifier `robots.txt`/`sitemap.xml` sur le vrai domaine une fois déployé (aucun `localhost` résiduel)

## Fiche Chalet du Voyageur (SEO)

- [x] HTTP 200, `index, follow` en local
- [x] Title, description, Open Graph, JSON-LD `CreativeWork` + `BreadcrumbList` présents
- [ ] Vérifier le canonical sur le vrai domaine une fois en ligne

## Téléchargement

- [x] Endpoint testé en local contre le vrai projet Supabase : URL signée, TTL 60 s exact, `download_count` incrémenté puis restauré
- [x] Réponse identique (404) pour fileId malformé, inexistant, ou construction non vérifiée
- [x] Aucune URL Storage permanente exposée, aucune clé service_role côté client
- [ ] Test réel depuis le domaine de production

## Responsive

- [x] 375 / 768 / 1024 / 1920 px testés (homepage, fiche Chalet, galerie/lightbox, matériaux, bandeau cookies, footer) — aucun débordement horizontal

## Erreurs / 404

- [x] Construction inexistante → 404 propre
- [x] `fileId` invalide/inexistant → 404 JSON identique, aucune fuite d'info
- [x] Route inexistante → 404 propre
- [x] Aucune stack trace ni secret exposé

## En-têtes de sécurité

- [x] `X-Content-Type-Options: nosniff`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` restrictive (camera/microphone/géoloc désactivés)
- [x] `Content-Security-Policy: frame-ancestors 'none'` (anti-clickjacking)
- [x] `X-Powered-By` retiré
- [ ] CSP complète (script-src/img-src/connect-src) — **volontairement hors scope**, à traiter dans une étape dédiée pour ne pas risquer de casser Supabase/GA4/Next.js sans test approfondi

## Performance

- [x] Images servies via `next/image` avec tailles responsives réelles (vérifié sur le réseau)
- [x] Polices Geist auto-hébergées (`next/font`, aucune requête externe)
- [x] JS client limité aux composants qui en ont réellement besoin (galerie, consentement, recherche, formulaires admin)
- [ ] Audit Lighthouse/PageSpeed réel — nécessite le domaine de production (`next dev` n'est pas représentatif du TTFB/LCP réel)

## Sauvegarde / rollback

- [ ] Vérifier que Supabase a des sauvegardes automatiques actives sur le plan utilisé (à confirmer dans le dashboard Supabase)
- [ ] Confirmer que chaque déploiement Vercel reste réactivable individuellement (comportement par défaut de Vercel — pas de configuration requise, à vérifier une fois le premier déploiement fait)
