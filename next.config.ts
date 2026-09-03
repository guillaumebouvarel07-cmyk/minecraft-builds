import type { NextConfig } from "next";

function supabaseStorageHostname(): string | undefined {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return undefined;
  }
}

const supabaseHostname = supabaseStorageHostname();

const nextConfig: NextConfig = {
  // Retire l'en-tête "X-Powered-By: Next.js" — aucune fonction, juste une
  // information technique gratuite à ne pas donner.
  poweredByHeader: false,
  // Next.js limite le corps d'une Server Action à 1 Mo par défaut — trop
  // peu pour l'upload d'images (jusqu'à 5 Mo/fichier, potentiellement
  // plusieurs à la fois). La limite de 5 Mo par fichier reste appliquée
  // dans actions/images.ts et sur le bucket Supabase Storage lui-même ;
  // ceci ne fait qu'élargir la marge autorisée par Next.js en amont.
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  // Étape 22 : uniquement les en-têtes de sécurité à risque quasi nul —
  // aucun d'eux ne peut casser Supabase, les images, ou GA4 après
  // consentement. Une Content-Security-Policy reste volontairement hors
  // scope ici : une CSP mal calibrée peut silencieusement bloquer GA4, les
  // Server Actions ou les images Supabase, et mérite son propre test
  // approfondi plutôt qu'un ajout risqué dans cette étape (voir le rapport
  // de l'étape 22, section headers).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Équivalent moderne de X-Frame-Options: DENY — le site n'a
          // aucune raison d'être embarqué dans une iframe tierce.
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
