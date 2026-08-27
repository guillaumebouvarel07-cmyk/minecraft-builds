import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les images distantes (Supabase Storage) seront autorisées ici à l'étape 5.
  // Exemple pour plus tard :
  // images: {
  //   remotePatterns: [
  //     { protocol: "https", hostname: "<projet>.supabase.co", pathname: "/storage/v1/object/public/**" },
  //   ],
  // },
};

export default nextConfig;
