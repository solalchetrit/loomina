import { NextRequest, NextResponse } from "next/server";
import { LOOMINA_CONFIG } from "@/config/loomina";

export async function POST(request: NextRequest) {
    console.log("=== [Verify API] Request received ===");

    try {
        const body = await request.json();
        const { action, phone_number, otp_code } = body;

        console.log("[Verify API] Parsed body:", { action, phone_number: phone_number ? "***" + phone_number.slice(-4) : "missing", has_otp: !!otp_code });

        // Basic validation
        if (!action || !phone_number) {
            console.error("[Verify API] Validation failed - missing fields");
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const webhookUrl = LOOMINA_CONFIG.MAKE_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error("[Verify API] Configuration Error: Webhook URL missing");
            return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
        }

        console.log("[Verify API] Webhook URL:", webhookUrl);

        // Forward request to Make.com
        const payload: any = {
            action,
            phone_number
        };

        if (otp_code) {
            payload.otp_code = otp_code;
        }

        console.log(`[Verify API] Forwarding ${action} for ${phone_number} to Make.com webhook...`);
        console.log("[Verify API] Payload:", JSON.stringify(payload, null, 2));

        // Pass an AbortController for timeout safety
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const startTime = Date.now();
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const duration = Date.now() - startTime;
            console.log(`[Verify API] Make.com responded in ${duration}ms with status: ${response.status}`);

            // Handle non-200 responses from Make
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Verify API] Webhook error ${response.status}:`, errorText);
                return NextResponse.json(
                    { message: "Verification service unavailable", details: errorText },
                    { status: response.status }
                );
            }

            // Return the Make.com response
            const data = await response.json();
            console.log("[Verify API] Make.com response:", JSON.stringify(data, null, 2));
            return NextResponse.json(data);

        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error("[Verify API] Fetch failed:", fetchError);

            // If it's a timeout
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.error("[Verify API] Request timed out after 10s");
                return NextResponse.json({ message: "Verification timed out" }, { status: 504 });
            }
            throw fetchError;
        }

    } catch (error) {
        console.error("[Verify API] Handler error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
