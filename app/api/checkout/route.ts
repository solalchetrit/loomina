import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, phone, email, isGift } = body;

        // Validation simple
        if (!email || !firstName || !lastName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Base URL for success/cancel redirects
        // Utilise l'URL de base de la requête ou une variable d'environnement
        const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "Biographie Loomina - Coffret Premium",
                            description: "Accompagnement, Interviews IA, Édition et Impression.",
                            images: ["https://www.loomina.eu/hero-book-v2.png"],
                        },
                        unit_amount: 44900, // 449.00 EUR
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
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
