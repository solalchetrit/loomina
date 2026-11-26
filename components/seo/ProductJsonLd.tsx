import { SITE } from "@/config/site";
import { OFFER, SHOW_PRICE, isLaunchOffer } from "@/config/offer";

/**
 * La fiche produit envoyée à Google : seulement sur l'accueil et sur « Le livre et le prix »,
 * les deux pages qui vendent le livre. (Avant le 20/11/2026 elle était sur toutes les pages,
 * y compris les mentions légales et le blog.)
 */
export default function ProductJsonLd() {
  // Avant le lancement, aucun prix n'est affiché : pas de fiche produit avec un prix pour Google.
  if (!SHOW_PRICE) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: OFFER.name,
    image: `${SITE.url}/og-image.jpg`,
    description: "Un livre imprimé qui raconte votre vie, écrit à partir d’entretiens par téléphone avec Loomina, une intelligence artificielle, et relu par notre équipe.",
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/offre`,
      priceCurrency: "EUR",
      price: OFFER.price.toFixed(2),
      ...(isLaunchOffer() ? { priceValidUntil: "2026-12-24" } : {}),
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE.url}/#organisation` },
      // Livraison incluse en France métropolitaine (config/offer.ts).
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "EUR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "FR" },
      },
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
