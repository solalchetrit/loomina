import { NextRequest, NextResponse } from "next/server";
import { LOOMINA_CONFIG } from "@/config/loomina";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, phone_number, otp_code } = body;

        // Basic validation
        if (!action || !phone_number) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const webhookUrl = LOOMINA_CONFIG.MAKE_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error("Configuration Error: Webhook URL missing");
            return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
        }

        // Forward request to Make.com
        // We only forward the necessary data to avoid leaking other info
        const payload: any = {
            action,
            phone_number
        };

        if (otp_code) {
            payload.otp_code = otp_code;
        }

        console.log(`[Verify API] Forwarding ${action} for ${phone_number} to webhook.`);

        // Pass an AbortController for timeout safety (Make can be slow)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            // Handle non-200 responses from Make
            if (!response.ok) {
                console.warn(`[Verify API] Webhook error: ${response.status}`);
                return NextResponse.json(
                    { message: "Verification service unavailable" },
                    { status: response.status }
                );
            }

            // Return the Make.com response directly (or parse/sanitize if needed)
            const data = await response.json();
            return NextResponse.json(data);

        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error("[Verify API] Fetch failed:", fetchError);
            // If it's a timeout, we return a gateway timeout
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json({ message: "Verification timed out" }, { status: 504 });
            }
            throw fetchError;
        }

    } catch (error) {
        console.error("[Verify API] Handler error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
