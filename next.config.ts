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

const nextConfig: NextConfig = {
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
