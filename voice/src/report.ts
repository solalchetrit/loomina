/**
 * Rapport de fin d'appel.
 *
 * Il reprend la forme du `end-of-call-report` de Vapi, parce que tout
 * l'aval (webhook Next.js, `call_events`, Directeur, Écrivain, vue
 * `call_metrics`) la lit déjà. Changer de fournisseur de voix ne doit
 * rien changer à la fabrication des chapitres.
 */

import { config } from './config.ts';

export interface TurnRecord {
    role: 'bot' | 'user';
    message: string;
    time: number;
}

export interface CallReportInput {
    callSid: string;
    from: string;
    to: string;
    direction: string;
    startedAt: Date;
    endedAt: Date;
    endedReason: string;
    turns: TurnRecord[];
    metadata: Record<string, unknown>;
    modelLatenciesMs: number[];
    promptTokens: number;
    completionTokens: number;
    interruptions: number;
}

function average(values: number[]): number | null {
    if (!values.length) return null;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** Même mise en forme que le transcript Vapi : « AI: … » / « User: … ». */
export function renderTranscript(turns: TurnRecord[]): string {
    return turns
        .filter((t) => t.message.trim())
        .map((t) => `${t.role === 'bot' ? 'AI' : 'User'}: ${t.message.trim()}`)
        .join('\n');
}

export function buildEndOfCallReport(input: CallReportInput) {
    const durationSeconds = Math.round((input.endedAt.getTime() - input.startedAt.getTime()) / 1000);
    const customerNumber = input.direction.startsWith('outbound') ? input.to : input.from;

    return {
        message: {
            type: 'end-of-call-report',
            endedReason: input.endedReason,
            startedAt: input.startedAt.toISOString(),
            endedAt: input.endedAt.toISOString(),
            durationSeconds,
            transcript: renderTranscript(input.turns),
            customer: { number: customerNumber },
            call: {
                id: input.callSid,
                customer: { number: customerNumber },
                metadata: input.metadata,
                provider: 'twilio-conversationrelay',
            },
            artifact: {
                transcript: renderTranscript(input.turns),
                messages: input.turns.map((t) => ({
                    role: t.role,
                    message: t.message,
                    time: t.time,
                })),
                performanceMetrics: {
                    modelLatencyAverage: average(input.modelLatenciesMs),
                    numAssistantInterrupted: input.interruptions,
                },
            },
            // Coût Twilio/ElevenLabs/Deepgram non connu ici ; le modèle seul.
            costBreakdown: {
                llmPromptTokens: input.promptTokens,
                llmCompletionTokens: input.completionTokens,
            },
        },
    };
}

/** Envoie le rapport au site, exactement comme Vapi le faisait. */
export async function postEndOfCallReport(report: ReturnType<typeof buildEndOfCallReport>): Promise<void> {
    const url = `${config.nextBaseUrl}/api/vapi/webhook`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-vapi-secret': config.webhookSecret,
        },
        body: JSON.stringify(report),
    });
    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`Rapport refusé par ${url} : ${response.status} ${detail.slice(0, 200)}`);
    }
}
