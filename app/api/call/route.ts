import { NextRequest, NextResponse } from "next/server";
import { formatToE164 } from "@/lib/phone";
import { supabase } from "@/lib/supabase";

// Vapi credentials (from Make.com blueprint)
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_PHONE_NUMBER_ID = "9c12d63e-ad70-4e8a-bc6e-28b3f17fb5a6";
const VAPI_SERVER_URL = "https://hook.eu1.make.com/s9yafdfjfsw5koknvrvzqocv64nf72ih";

export async function POST(request: NextRequest) {
    console.log("=== [Call API] Request received ===");

    try {
        const body = await request.json();
        const { phone_number } = body;

        if (!phone_number) {
            return NextResponse.json({ message: "Missing phone_number" }, { status: 400 });
        }

        const formattedPhone = formatToE164(phone_number);
        console.log("[Call API] Formatted phone:", formattedPhone);

        // 1. Get client info from Supabase via RPC
        const { data: clientData, error: clientError } = await supabase
            .rpc('check_client_exists', { phone_input: phone_number });

        if (clientError || !clientData || clientData.length === 0 || !clientData[0].client_found) {
            console.error("[Call API] Client not found:", clientError);
            return NextResponse.json({ message: "Client not found" }, { status: 404 });
        }

        // Get full client details using the matched phone
        const matchedPhone = clientData[0].matched_phone;
        const { data: fullClient, error: fullClientError } = await supabase
            .from('Client')
            .select('id, first_name, last_name, politeness_preference, writing_style, sensitive_topics')
            .or(`phone_number.eq.${matchedPhone},phone_number.eq.${formattedPhone}`)
            .limit(1)
            .single();

        if (fullClientError || !fullClient) {
            console.error("[Call API] Could not fetch client details:", fullClientError);
            // Fallback to basic call
        }

        const clientFirstName = fullClient?.first_name || "cher client";
        const politenessPreference = fullClient?.politeness_preference || "vous";
        const writingStyle = fullClient?.writing_style || "Naturel et sincère";
        const sensitiveTopics = fullClient?.sensitive_topics || "Aucun";

        console.log("[Call API] Client found:", clientFirstName);

        // 2. Get story context if available
        let context = "Première exploration ensemble.";
        const currentSubject = "RACINES ET ORIGINES";
        const nextQuestion = "Parlez-moi de vos racines familiales, de vos grands-parents.";

        if (fullClient) {
            const { data: storyData } = await supabase
                .rpc('get_client_stories', { phone_input: phone_number });

            if (storyData && storyData.length > 0 && storyData[0].story_content) {
                const lastStory = storyData[storyData.length - 1];
                context = `Dernière histoire : "${lastStory.story_title}" - ${lastStory.story_content?.substring(0, 200)}...`;
            }
        }

        // 3. Build Vapi call payload
        const vapiPayload = {
            phoneNumberId: VAPI_PHONE_NUMBER_ID,
            customer: {
                number: formattedPhone
            },
            assistant: {
                transcriber: {
                    provider: "deepgram",
                    model: "nova-3",
                    language: "fr"
                },
                firstMessageMode: "assistant-speaks-first",
                name: "Loomina-Interview-Outbound",
                voice: {
                    provider: "11labs",
                    voiceId: "Qrl71rx6Yg8RvyPYRGCQ",
                    model: "eleven_turbo_v2_5"
                },
                endCallPhrases: ["##END_CALL##"],
                firstMessage: `Bonjour ${clientFirstName}, je suis ravi de vous retrouver. ${nextQuestion}`,
                serverUrl: VAPI_SERVER_URL,
                model: {
                    provider: "openai",
                    model: "gpt-4o",
                    messages: [{
                        role: "system",
                        content: `Tu es Loomina, un biographe masculin chaleureux et empathique. Tu accompagnes ${clientFirstName} dans l'écriture de sa biographie.

# TA MISSION
Recueillir l'histoire de vie de ${clientFirstName} avec profondeur et authenticité.

# MÉMOIRE: ${context}
# SUJET ACTUEL: ${currentSubject}
# QUESTION PRÉPARÉE: ${nextQuestion}

# PRÉFÉRENCES CLIENT
- Politesse: ${politenessPreference}
- Style souhaité: ${writingStyle}
- Sujets à éviter: ${sensitiveTopics}

# RÈGLES
1. UNE SEULE question à la fois
2. Demande des anecdotes ("Racontez-moi...")
3. Valide l'émotion avant de relancer
4. Respecte le rythme du narrateur
5. Utilise le ${politenessPreference} IMPÉRATIVEMENT`
                    }],
                    tools: [{
                        type: "endCall",
                        messages: [{
                            type: "request-start",
                            content: "A bientôt !"
                        }]
                    }]
                },
                hooks: [{
                    on: "customer.speech.timeout",
                    options: {
                        timeoutSeconds: 60,
                        triggerMaxCount: 1,
                        triggerResetMode: "onUserSpeech"
                    },
                    do: [{
                        type: "say",
                        exact: "Êtes-vous toujours là ?"
                    }]
                }]
            }
        };

        console.log("[Call API] Calling Vapi...");

        // 4. Call Vapi API
        const vapiResponse = await fetch("https://api.vapi.ai/call", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${VAPI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(vapiPayload)
        });

        const vapiData = await vapiResponse.json();
        console.log("[Call API] Vapi response:", JSON.stringify(vapiData, null, 2));

        if (!vapiResponse.ok) {
            console.error("[Call API] Vapi error:", vapiData);
            return NextResponse.json({
                message: "Failed to initiate call",
                error: vapiData.message || vapiData.error || "Unknown error"
            }, { status: vapiResponse.status });
        }

        return NextResponse.json({
            message: "Appel déclenché avec succès",
            callId: vapiData.id
        });

    } catch (error) {
        console.error("[Call API] Handler error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}