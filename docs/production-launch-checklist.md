# Checklist de lancement production — Blokprint

Établie à l'étape 22 (audit de préparation au déploiement). Chaque case
reflète l'état réel constaté à cette date, pas un objectif générique —
revérifier avant le lancement effectif si du temps s'est écoulé.

## Domaine et hébergement (Netlify)

- [x] Domaine réel choisi : `blokprint.fr`
- [ ] Domaine connecté au site Netlify (*Domain management*)
- [x] Version canonique choisie : `https://blokprint.fr` (sans `www`) — `www.blokprint.fr` à rediriger en 301 si le domaine est acheté avec ce sous-domaine par défaut
- [ ] DNS configurés selon les valeurs exactes données par Netlify (jamais des valeurs génériques — Netlify les affiche dans *Domain management* une fois le domaine ajouté)
- [ ] Certificat HTTPS actif sur le domaine (Netlify le provisionne automatiquement — Let's Encrypt — une fois les DNS propagés)
- [ ] Redirection HTTP → HTTPS vérifiée
- [ ] Aucun mixed content

## Variables d'environnement (Netlify → Production)

- [ ] `NEXT_PUBLIC_SITE_URL` = `https://blokprint.fr` (jamais `localhost`, jamais un sous-domaine `*.netlify.app`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement — jamais préfixée `NEXT_PUBLIC_`)
- [ ] `ADMIN_EMAIL`
- [ ] `GOOGLE_SITE_VERIFICATION` (si Search Console déjà configuré)
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optionnel — le site fonctionne sans)
- [ ] Les mêmes variables sont cohérentes en Deploy Preview / Branch deploy (voir rapport de la migration Netlify pour la stratégie previews)
- [ ] Le scoping par contexte (Builds/Functions/Runtime) n'est pas disponible sur le plan Free — toutes les variables sont donc partagées build+runtime par défaut ; c'est acceptable ici car `SUPABASE_SERVICE_ROLE_KEY` n'est de toute façon jamais lue pendant `next build` (voir rapport, section H)

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
- [x] `CONTEXT !== "production"` (Netlify) empêche GA4 sur Deploy Preview/Branch deploy même avec un ID configuré — remplace l'ancienne logique `VERCEL_ENV` (voir `lib/deployment.ts`)
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` réel configuré (optionnel — pas un blocker de lancement)
- [ ] Test réel sur le domaine de production une fois en ligne (impossible à vérifier avant le premier vrai déploiement Netlify)

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

## Netlify — spécifique migration

- [x] Toute référence à `VERCEL_ENV`/`VERCEL_URL` retirée du code (`lib/deployment.ts` remplace l'ancienne logique)
- [x] `netlify.toml` créé (minimal : `NODE_VERSION`, `SECRETS_SCAN_OMIT_PATHS` — voir ce fichier pour la justification complète)
- [ ] Premier déploiement réel effectué et vérifié (rien de ce qui suit n'est testable avant)
- [ ] En-têtes de sécurité (`next.config.ts` → `headers()`) confirmés présents sur la vraie réponse HTTP de production (`curl -I https://blokprint.fr`) — des bugs du Next.js Runtime Netifly ont historiquement fait disparaître les headers `next.config.js` en production alors qu'ils fonctionnaient en local ; à revérifier explicitement, pas supposé fonctionner par défaut
- [ ] Upload de plusieurs images (formulaire admin, jusqu'à ~20 Mo cumulés) testé en conditions réelles — les Netlify Functions synchrones ont une limite connue de 6 Mo de payload (20 Mo si la réponse est streamée) ; le comportement réel de la Server Action `uploadConstructionImages` sur Netlify n'a pas pu être vérifié en local
- [ ] Politique Deploy Previews confirmée sans danger pour la base Supabase de production (voir rapport, section F)

## Sauvegarde / rollback

- [ ] Vérifier que Supabase a des sauvegardes automatiques actives sur le plan utilisé (à confirmer dans le dashboard Supabase)
- [ ] Confirmer que chaque déploiement Netlify reste réactivable individuellement (*Deploys → [ancien déploiement] → Publish deploy* — comportement par défaut, pas de configuration requise, à vérifier une fois le premier déploiement fait)
