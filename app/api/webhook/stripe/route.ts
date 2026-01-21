import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Init Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Init Supabase Service Role (Admin) pour pouvoir écrire sans restriction
// ATTENTION: Il faut la clé SERVICE_ROLE, pas la clé ANON, pour contourner les RLS si besoin
// ou s'assurer que les policies permettent l'insert.
// Pour l'instant on utilise SUPABASE_SERVICE_ROLE_KEY si dispo, sinon on tente avec l'ANON key mais ça risque de bloquer si RLS activé.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    const payload = await request.text();
    const sig = request.headers.get("stripe-signature");

    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) {
            console.error("Webhook Error: Missing signature or secret");
            return NextResponse.json({ error: "Configuration error" }, { status: 400 });
        }
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err);
        return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : String(err)}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("✅ Paiement réussi pour session:", session.id);

        // Récupérer les metadata injectées lors du checkout
        const metadata = session.metadata;

        if (metadata && metadata.email) {
            const { firstName, lastName, phone, email, isGift } = metadata;

            console.log(`Processing activation for ${email} (${firstName} ${lastName})`);

            try {
                // 1. Check if profile exists (by email) -> Auth ?
                // Idéalement on provisionne un user Auth, mais pour l'instant on va remplir la table `profiles` publique si utilisée ainsi.
                // NOTE: Dans Supabase, `profiles` est souvent lié à `auth.users`. Si l'user n'a pas de compte Auth, on ne peut peut-être pas créer de profile si la foreign key est stricte.
                // On va supposer ici qu'on peut créer une entrée ou qu'on doit inviter l'user.

                // STRATÉGIE SIMPLIFIÉE PAIEMENT:
                // On cherche si un profile existe avec cet email (si la colonne email existe dans profiles, ce qui est le cas d'après l'audit)

                // A. Check if user exists in profiles or auth
                // On ne peut pas facilement créer un `auth.user` via l'API client sans admin API.
                // Ici on utilise la clé Service Role, donc on a les droits admin.

                // On vachercher l'utilisateur dans auth.users (via admin api) ? 
                // Pour simplifier, on va insérer dans `profiles` directement.
                // ATTENTION: `profiles` a besoin d'un `id` qui match `auth.users.id`.

                // ÉTAPE CRITIQUE: Créer le User AUTH d'abord (Invitation)
                const { data: userData, error: userError } = await supabase.auth.admin.createUser({
                    email: email,
                    email_confirm: true, // Auto confirm
                    user_metadata: { first_name: firstName, last_name: lastName }
                });

                let userId = userData.user?.id;

                if (userError) {
                    // Si l'user existe déjà, on essaye de le récupérer
                    console.log("User creation note:", userError.message);
                    // On pourrait chercher l'ID via une requête RPC ou admin, mais admin.createUser renvoie une erreur si existe.
                    // Fallback: Si on ne peut pas créer, on suppose qu'il existe. Mais on n'a pas son ID facilement sans une autre query.
                    // On va tenter de find dans profiles par email si possible.

                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('email', email)
                        .single();

                    if (existingProfile) {
                        userId = existingProfile.id;
                    }
                }

                if (userId) {
                    console.log("User ID resolved:", userId);

                    // 2. Upsert Profile
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: userId,
                            full_name: `${firstName} ${lastName}`,
                            first_name: firstName,
                            last_name: lastName,
                            email: email,
                            phone_number: phone,
                            // Default preferences
                            politeness_preference: "vous",
                            writing_style: "Naturel",
                            created_at: new Date().toISOString()
                        });

                    if (profileError) console.error("Profile upsert error:", profileError);

                    // 3. Create Project
                    const { error: projectError } = await supabase
                        .from('projects')
                        .insert({
                            user_id: userId,
                            title: `Biographie de ${firstName}`,
                            status: 'active', // ACTIVÉ !
                            current_phase: "Vue d'ensemble",
                            current_topic_id: 1,
                            global_context: "Nouveau projet démarré après paiement.",
                            project_metadata: { is_gift: isGift, stripe_session_id: session.id }
                        });

                    if (projectError) console.error("Project creation error:", projectError);
                    else console.log("✅ Projet créé et activé avec succès !");

                } else {
                    console.error("Impossible de résoudre le UserID pour", email);
                }

            } catch (logicError) {
                console.error("Logic Error in webhook:", logicError);
            }
        }
    }

    return NextResponse.json({ received: true });
}
