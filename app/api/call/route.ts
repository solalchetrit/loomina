import { NextRequest, NextResponse } from "next/server";
import { formatToE164 } from "@/lib/phone";
import { createClient } from "@supabase/supabase-js";

// Vapi credentials
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_PHONE_NUMBER_ID = "9c12d63e-ad70-4e8a-bc6e-28b3f17fb5a6";
const VAPI_SERVER_URL = "https://hook.eu1.make.com/s9yafdfjfsw5koknvrvzqocv64nf72ih";

// Init Supabase with Service Role to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple normalization map for phases
const PHASE_MAP: Record<string, string> = {
    "Vue d'Ensemble": "vue_ensemble",
    "Vue d'ensemble": "vue_ensemble",
    "Construction": "construction",
    "Accomplissements": "accomplissements",
    "Messages": "messages"
};

export async function POST(request: NextRequest) {
    console.log("=== [Call API] Request received (Centralized Prompt Version) ===");

    try {
        const body = await request.json();
        const { phone_number } = body;

        if (!phone_number) {
            return NextResponse.json({ message: "Missing phone_number" }, { status: 400 });
        }

        const formattedPhone = formatToE164(phone_number);
        console.log("[Call API] Formatted phone:", formattedPhone);

        // 1. Get Profile (Unified Table)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .in('phone_number', [formattedPhone, phone_number])
            .maybeSingle();

        if (profileError || !profile) {
            console.error(`[Call API] Profile search failed. Criteria: [${formattedPhone}, ${phone_number}]`);
            console.error("[Call API] Profile error:", profileError);
            return NextResponse.json({ message: "Client profil not found" }, { status: 404 });
        }

        console.log(`[Call API] Found profile: ${profile.first_name} ${profile.last_name}`);

        // 2. Get Active Project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', profile.id)
            .eq('status', 'active')
            .maybeSingle();

        if (projectError) console.error("Project fetch error:", projectError);

        // Default values if no project (Fallback to Phase 1)
        const currentPhase = project?.current_phase || "Vue d'Ensemble";
        const globalContext = project?.global_context || "Premier appel.";
        const nextStrategy = project?.next_question_strategy || "Commencer par faire connaissance.";

        // 3. Fetch System Prompt from Supabase
        const phaseKey = PHASE_MAP[currentPhase] || "vue_ensemble";

        const { data: promptData, error: promptError } = await supabase
            .from('system_prompts')
            .select('prompt_content, first_message_template')
            .eq('phase_key', phaseKey)
            .single();

        if (promptError || !promptData) {
            console.error("Prompt fetch error:", promptError);
            return NextResponse.json({ message: "System Prompt not found" }, { status: 500 });
        }

        let finalSystemPrompt = promptData.prompt_content;
        let finalFirstMessage = promptData.first_message_template || `Bonjour ${profile.first_name}, ici Loomina.`;

        // 4. Inject Variables (Templating)
        const variables: Record<string, string> = {
            "{{first_name}}": profile.first_name || "Cher client",
            "{{politeness_preference}}": profile.politeness_preference || "vous",
            "{{writing_style}}": profile.writing_style || "Naturel",
            "{{sensitive_topics}}": profile.sensitive_topics || "Aucun",
            "{{global_context}}": globalContext,
            "{{next_question_strategy}}": nextStrategy
        };

        for (const [key, value] of Object.entries(variables)) {
            // Global replace
            finalSystemPrompt = finalSystemPrompt.split(key).join(value || "");
            finalFirstMessage = finalFirstMessage.split(key).join(value || "");
        }

        console.log(`[Call API] Generated prompt for phase [${phaseKey}]`);

        // 5. Build Vapi Payload
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
                name: `Loomina-${phaseKey}`,
                voice: {
                    provider: "11labs",
                    voiceId: "Qrl71rx6Yg8RvyPYRGCQ",
                    model: "eleven_turbo_v2_5"
                },
                endCallPhrases: ["##END_CALL##"],
                // Dynamic First Message based on context
                firstMessage: finalFirstMessage,
                serverUrl: VAPI_SERVER_URL,
                model: {
                    provider: "openai",
                    model: "gpt-4o",
                    messages: [{
                        role: "system",
                        content: finalSystemPrompt
                    }],
                    tools: [{
                        type: "endCall",
                        messages: [{
                            type: "request-start",
                            content: "A bientôt !"
                        }]
                    }]
                },
                silenceTimeoutSeconds: 60,
                backgroundSound: "off" // Ensure clean audio
            }
        };

        // 6. Call Vapi
        const vapiResponse = await fetch("https://api.vapi.ai/call", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${VAPI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(vapiPayload)
        });

        const vapiResData = await vapiResponse.json();

        if (!vapiResponse.ok) {
            console.error("[Call API] Vapi error:", vapiResData);
            return NextResponse.json({ error: vapiResData }, { status: vapiResponse.status });
        }

        return NextResponse.json({
            message: "Call initiated successfully",
            callId: vapiResData.id,
            phase: phaseKey
        });

    } catch (error) {
        console.error("[Call API] Internal Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: String(error) },
            { status: 500 }
        );
    }
}