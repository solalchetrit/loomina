import { NextRequest, NextResponse } from "next/server";
import { OFFER } from "@/config/offer";
import { stripe } from "@/lib/stripe";
import { normalizeCallMinutes } from "@/lib/loomina/call-length";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, phone, email, isGift, callMinutes, giverFirstName, giverPhone } = body;

        // Validation simple
        if (!email || !firstName || !lastName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Base URL for success/cancel redirects
        // Utilise l'URL de base de la requête ou une variable d'environnement
        const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        // Create Checkout Session
        const session = await stripe().checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Loomina — ${OFFER.name}`,
                            description: `Entretiens par téléphone, écriture, relecture humaine, livre relié (${OFFER.format}) livré chez vous, version numérique.`,
                            images: ["https://www.loomina.eu/og-image.jpg"],
                        },
                        unit_amount: OFFER.price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            // Panier abandonné : la page de paiement expire au bout de deux heures.
            // Stripe nous prévient alors (checkout.session.expired) et fournit un lien
            // qui rouvre la commande telle quelle : on l'envoie une fois, par e-mail
            // et par SMS (voir app/api/webhook/stripe).
            expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
            after_expiration: { recovery: { enabled: true, allow_promotion_codes: true } },
            // Permet les codes promo (dont un code 100 % réservé aux tests du parcours complet)
            allow_promotion_codes: true,
            customer_email: email, // Pré-remplit l'email dans Stripe
            success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/order`,
            metadata: {
                firstName,
                lastName,
                phone,
                email,
                isGift: isGift ? "true" : "false",
                callMinutes: String(normalizeCallMinutes(callMinutes)),
                // Livre offert : la personne qui offre, pour son espace famille.
                giverFirstName: isGift && typeof giverFirstName === "string" ? giverFirstName.trim().slice(0, 60) : "",
                giverPhone: isGift && typeof giverPhone === "string" ? giverPhone.trim().slice(0, 20) : "",
                // On pourrait ajouter un userId ici si l'utilisateur était authentifié via Supabase Auth
                // userId: user.id
            },
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
