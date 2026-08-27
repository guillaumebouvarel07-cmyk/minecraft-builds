# Blokprint

Plateforme de recherche et de découverte de constructions à bâtir.

> `Blokprint` est un nom de travail. Pour le changer, modifie uniquement `lib/site.ts`.

**Statut : étape 0 — projet initialisé.** Aucune base de données n'est encore connectée.

---

## Prérequis

- **Node.js 20.9 ou plus** — vérifie avec `node --version`, télécharge sur [nodejs.org](https://nodejs.org) si besoin.
- **Git** — vérifie avec `git --version`, télécharge sur [git-scm.com](https://git-scm.com).

## Démarrer en local

```bash
npm install          # à faire une seule fois (télécharge les dépendances)
cp .env.example .env.local
npm run dev          # démarre le serveur de développement
```

Puis ouvre <http://localhost:3000>.

Sous Windows PowerShell, remplace `cp` par :

```powershell
Copy-Item .env.example .env.local
```

## Commandes disponibles

| Commande            | Rôle                                                   |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Serveur de développement, rechargement automatique     |
| `npm run build`     | Build de production — doit passer sans aucune erreur    |
| `npm start`         | Lance le build de production en local                  |
| `npm run typecheck` | Vérifie les types TypeScript                           |
| `npm run lint`      | Vérifie la qualité du code                             |

## Stack

| Couche       | Choix                       |
| ------------ | --------------------------- |
| Framework    | Next.js 16 (App Router)     |
| Langage      | TypeScript (mode strict)    |
| Styles       | Tailwind CSS v4             |
| Base de données | PostgreSQL via Supabase *(étape 1)* |
| Hébergement  | Vercel                      |

## Structure du projet

```
app/                    Pages et routage (App Router)
  layout.tsx            Enveloppe commune à toutes les pages
  page.tsx              Page d'accueil
  globals.css           Styles globaux + design tokens Tailwind
components/
  layout/               Header, Footer, fil d'ariane
  ui/                   Briques réutilisables (boutons, badges...)
lib/
  site.ts               Nom, slogan et URL du site
public/                 Fichiers statiques (favicon, images fixes)
```

Règle de base : `app/` ne contient que du routage et de l'assemblage. Toute logique
réutilisable vit dans `components/` ou `lib/`.

## Variables d'environnement

Copie `.env.example` vers `.env.local` et remplis les valeurs.
`.env.local` est ignoré par Git — les clés secrètes ne partent jamais sur GitHub.

## Déploiement Vercel

Le projet est prêt pour Vercel : aucune configuration particulière n'est nécessaire,
Vercel détecte Next.js automatiquement.

1. Pousser le dépôt sur GitHub.
2. Sur [vercel.com](https://vercel.com) : *Add New Project* → importer le dépôt.
3. Renseigner les variables d'environnement dans *Settings → Environment Variables*.
4. Déployer.

## Mention légale

Ce site n'est pas un produit officiel Minecraft. Il n'est ni approuvé par, ni associé
à Mojang ou Microsoft.
