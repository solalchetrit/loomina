import type { NextConfig } from "next";

// En-têtes de sécurité de base. Pas de CSP sur les scripts : le layout
// embarque Google Analytics et le JSON-LD en inline, une CSP stricte les
// casserait sans nonce. `frame-ancestors` suffit à interdire l'intégration
// du site dans une iframe tierce (clickjacking).
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

// Copie du site pour l'hébergeur Claude (ARTIFACT=1) : dossier de build à part, images servies telles quelles.
const forArtifact = process.env.ARTIFACT === "1";

const nextConfig: NextConfig = {
  ...(forArtifact ? { distDir: ".next-artifact", images: { unoptimized: true }, turbopack: { resolveAlias: { "@/lib/loomina/artifact-hook": "./lib/loomina/artifact-api.ts" } } } : {}),
  // Le PDF du livre lit ses polices et le logo sur le disque : on les joint à ces fonctions.
  outputFileTracingIncludes: {
    "/api/user/book/pdf": ["./lib/fonts/**/*", "./public/header-logo-trimmed.png", "./public/logo-loomina-blanc.png"],
    "/api/admin/clients/*/livre-pdf": ["./lib/fonts/**/*", "./public/header-logo-trimmed.png", "./public/logo-loomina-blanc.png"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Anciennes adresses de la première version du site.
  async redirects() {
    return [
      { source: "/mission", destination: "/about", permanent: true },
      { source: "/offres", destination: "/offre", permanent: true },
      { source: "/accompagnement", destination: "/experience", permanent: true },
    ];
  },
};

export default nextConfig;
