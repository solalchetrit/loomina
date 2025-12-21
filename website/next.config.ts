import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/mission",
        destination: "/#mission",
        permanent: true,
      },
      {
        source: "/offres",
        destination: "/#offres",
        permanent: true,
      },
      {
        source: "/accompagnement",
        destination: "/#process",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
