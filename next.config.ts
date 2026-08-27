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
};

export default nextConfig;
