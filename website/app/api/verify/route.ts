import { NextRequest, NextResponse } from "next/server";
import { formatToE164 } from "@/lib/phone";

// Twilio Credentials (hardcoded for now to ensure immediate fix, should be moved to env)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID;

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { action, phone_number, otp_code } = body;

    const formattedPhone = formatToE164(phone_number);
    const authHeader = "Basic " + Buffer.from(TWILIO_ACCOUNT_SID + ":" + TWILIO_AUTH_TOKEN).toString("base64");

    try {
        if (action === "start") {
            const params = new URLSearchParams();
            params.append("To", formattedPhone);
            params.append("Channel", "sms");

            const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/Verifications`, {
                method: "POST",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Twilio Error (Start):", data);
                return NextResponse.json(data, { status: response.status });
            }

            return NextResponse.json({ status: data.status, sid: data.sid });

        } else if (action === "check") {
            const params = new URLSearchParams();
            params.append("To", formattedPhone);
            params.append("Code", otp_code);

            const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/VerificationCheck`, {
                method: "POST",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Twilio Error (Check):", data);
                return NextResponse.json(data, { status: response.status });
            }

            return NextResponse.json({ status: data.status, valid: data.valid });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
