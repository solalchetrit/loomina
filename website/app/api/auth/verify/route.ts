import { NextRequest, NextResponse } from "next/server";
import { formatToE164 } from "@/lib/phone";

// Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

export async function POST(request: NextRequest) {
    console.log("=== [Verify API] Request received ===");

    try {
        // Check for required environment variables
        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
            console.error("[Verify API] Missing Twilio environment variables");
            return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
        }

        const body = await request.json();
        const { action, phone_number, otp_code } = body;

        console.log("[Verify API] Parsed body:", {
            action,
            phone_number: phone_number ? "***" + phone_number.slice(-4) : "missing",
            has_otp: !!otp_code
        });

        // Basic validation
        if (!action || !phone_number) {
            console.error("[Verify API] Validation failed - missing fields");
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const formattedPhone = formatToE164(phone_number);
        const authHeader = "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

        if (action === "start") {
            // Send verification code
            console.log(`[Verify API] Sending OTP to ${formattedPhone}`);

            const response = await fetch(
                `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": authHeader,
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        To: formattedPhone,
                        Channel: "sms"
                    })
                }
            );

            const data = await response.json();
            console.log("[Verify API] Twilio response:", JSON.stringify(data, null, 2));

            if (!response.ok) {
                console.error("[Verify API] Twilio error:", data);
                return NextResponse.json({
                    message: "Failed to send verification code",
                    error: data.message || "Unknown error"
                }, { status: response.status });
            }

            return NextResponse.json({
                status: data.status,
                sid: data.sid
            });

        } else if (action === "check") {
            // Verify the code
            console.log(`[Verify API] Verifying OTP for ${formattedPhone}`);

            if (!otp_code) {
                return NextResponse.json({ message: "Missing OTP code" }, { status: 400 });
            }

            const response = await fetch(
                `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": authHeader,
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        To: formattedPhone,
                        Code: otp_code
                    })
                }
            );

            const data = await response.json();
            console.log("[Verify API] Twilio verification response:", JSON.stringify(data, null, 2));

            if (!response.ok) {
                console.error("[Verify API] Twilio verification error:", data);
                return NextResponse.json({
                    message: "Verification failed",
                    error: data.message || "Unknown error"
                }, { status: response.status });
            }

            return NextResponse.json({
                status: data.status,
                valid: data.valid
            });

        } else {
            return NextResponse.json({ message: "Invalid action" }, { status: 400 });
        }

    } catch (error) {
        console.error("[Verify API] Handler error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
