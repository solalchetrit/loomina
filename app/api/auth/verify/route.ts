import { NextRequest, NextResponse } from "next/server";
import { formatToE164 } from "@/lib/phone";
import { SignJWT } from "jose";

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

            // 1. Check if user exists in Supabase
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                console.error("[Verify API] Missing Supabase environment variables");
                return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
            }

            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { data: rpcData, error: rpcError } = await supabase
                .rpc('check_client_exists', { phone_input: formattedPhone });

            if (rpcError) {
                console.error("[Verify API] RPC Error:", rpcError);
                // We might want to block or allow if DB fails? safest is block or 500.
                return NextResponse.json({ message: "Database error during verification check" }, { status: 500 });
            }

            const resultRow = (rpcData && rpcData.length > 0) ? rpcData[0] : null;

            if (!resultRow || !resultRow.client_found) {
                console.warn(`[Verify API] User not found for phone ${formattedPhone}. Blocking verification.`);
                return NextResponse.json({
                    message: "Numéro de téléphone inconnu. Avez-vous déjà passé commande ?"
                }, { status: 404 });
            }

            // Using the matched phone from DB ensures consistency, though check_client_exists logic 
            // usually handles normalization. logic below uses formattedPhone which should be fine.

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

            // Security: Create a session token (JWT)
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret-change-me");
            const jwt = await new SignJWT({ phone: formattedPhone, role: 'authenticated' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(secret);

            // Return success with formatted user session cookie
            const successResponse = NextResponse.json({
                status: data.status,
                valid: data.valid
            });

            successResponse.cookies.set('loomina_session', jwt, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });

            return successResponse;

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
