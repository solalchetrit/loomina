import { NextRequest, NextResponse } from "next/server";
import { OFFER, normalizeExtraCopies } from "@/config/offer";
import { extraCopiesLineItem } from "@/lib/loomina/extra-copies";
import { stripe } from "@/lib/stripe";
import { normalizeCallMinutes } from "@/lib/loomina/call-length";
import { isTestAuthorPhone } from "@/lib/loomina/test-author";
import { isTestFamilyPhone } from "@/lib/loomina/test-family";
import { encodeFamilyForStripe } from "@/lib/loomina/giver";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, phone, email, isGift, callMinutes, giverFirstName, giverPhone } = body;
        // Moyen choisi sur la page : carte (par défaut) ou Klarna (3 ou 4 fois).
        // Chaque choix a sa propre session Stripe : c'est ce qui permet d'afficher
        // nos propres boutons « Carte » et « 3 ou 4 fois » au lieu de la liste de Stripe.
        const method: "card" | "klarna" = body.method === "klarna" ? "klarna" : "card";
        // Exemplaires en plus du livre de l'auteur, pour la famille (config/offer.ts).
        const extraCopies = normalizeExtraCopies(body.extraCopies);
        const replaces = typeof body.replaces === "string" && /^cs_(live|test)_[A-Za-z0-9]+$/.test(body.replaces) ? body.replaces : null;

        // Validation simple
        if (!email || !firstName || !lastName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        // 06 12 34 56 78 et 07 12 34 56 78 sont les numéros des espaces de test : ils ne peuvent pas porter une vraie commande.
        if (isTestAuthorPhone(phone) || isTestAuthorPhone(giverPhone) || isTestFamilyPhone(phone) || isTestFamilyPhone(giverPhone)) {
            return NextResponse.json({ error: "Ce numéro sert à l’espace de test. Indiquez un vrai numéro de téléphone." }, { status: 400 });
        }

        // Base URL for success/cancel redirects
        // Utilise l'URL de base de la requête ou une variable d'environnement
        const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        // Paiement intégré au site (demande de Solal, 18/11/2026) : la page de
        // commande dessine elle-même le récapitulatif, le code promo et le bouton ;
        // Stripe ne fournit que le champ carte (ui_mode « custom », sans Link).
        // Il lui faut la clé publiable (pk_live_…, sans danger côté navigateur),
        // lue ici à l'exécution. Sans elle, on garde la page Stripe externe.
        const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY?.trim() || "";
        const embedded = publishableKey.startsWith("pk_");
        // Après paiement : page de bienvenue, qui ouvre ensuite l'espace (app/bienvenue).
        const welcomeUrl = `${origin}/bienvenue?session_id={CHECKOUT_SESSION_ID}`;

        // Paiement en 3 ou 4 fois (demande de Solal, 18/11/2026) : Klarna, activé
        // dans Stripe (Paramètres, Moyens de paiement). S'il ne l'était plus, Stripe
        // refuserait la session Klarna : la page retire alors le bouton.
        const create = (methods: ("card" | "klarna")[]) => stripe().checkout.sessions.create({
            ...(embedded
                ? { ui_mode: "custom" as const, return_url: welcomeUrl }
                : { success_url: welcomeUrl, cancel_url: `${origin}/order` }),
            payment_method_types: methods,
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Loomina — ${OFFER.name}`,
                            description: `Entretiens par téléphone, écriture, relecture humaine, livre imprimé (${OFFER.format}) livré chez vous, version numérique.`,
                            images: ["https://www.loomina.eu/og-image.jpg"],
                        },
                        unit_amount: OFFER.price * 100,
                    },
                    quantity: 1,
                },
                ...(extraCopies ? [extraCopiesLineItem(extraCopies)] : []),
            ],
            mode: "payment",
            // Panier abandonné : la page de paiement expire au bout de deux heures.
            // Stripe nous prévient alors (checkout.session.expired) et fournit un lien
            // qui rouvre la commande telle quelle : on l'envoie une fois, par e-mail
            // et par SMS (voir app/api/webhook/stripe).
            // En mode intégré, Stripe ne fournit pas de lien de reprise : la relance
            // renvoie alors vers la page de commande du site.
            expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
            ...(embedded ? {} : { after_expiration: { recovery: { enabled: true, allow_promotion_codes: true } } }),
            // Permet les codes promo (dont un code 100 % réservé aux tests du parcours complet)
            allow_promotion_codes: true,
            customer_email: email, // Pré-remplit l'email dans Stripe
            metadata: {
                firstName,
                lastName,
                phone,
                email,
                isGift: isGift ? "true" : "false",
                callMinutes: String(normalizeCallMinutes(callMinutes)),
                extraCopies: String(extraCopies),
                // Livre offert : la personne qui offre, pour son espace famille.
                giverFirstName: isGift && typeof giverFirstName === "string" ? giverFirstName.trim().slice(0, 60) : "",
                giverPhone: isGift && typeof giverPhone === "string" ? giverPhone.trim().slice(0, 20) : "",
                // Les autres proches qui suivront le livre dans l'espace famille.
                family: isGift ? encodeFamilyForStripe(body.familyMembers) : "",
                // On pourrait ajouter un userId ici si l'utilisateur était authentifié via Supabase Auth
                // userId: user.id
            },
        });

        // Changement de moyen : l'ancienne session ne doit pas déclencher de relance
        // de panier abandonné (voir app/api/webhook/stripe).
        if (embedded && replaces) {
            try {
                const old = await stripe().checkout.sessions.retrieve(replaces);
                if (old.metadata?.email === email && old.status === "open") {
                    await stripe().checkout.sessions.update(replaces, { metadata: { superseded: "true" } });
                }
            } catch {
                /* au pire, une relance de trop */
            }
        }

        let session;
        try {
            session = await create(embedded ? [method] : ["card"]);
        } catch (err) {
            if (method !== "klarna") throw err;
            console.warn("[checkout] Klarna indisponible :", err instanceof Error ? err.message : String(err));
            return NextResponse.json({ error: "klarna" }, { status: 502 });
        }

        if (embedded) {
            return NextResponse.json({ clientSecret: session.client_secret, publishableKey, method, installments: process.env.LOOMINA_KLARNA !== "off" });
        }
        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
