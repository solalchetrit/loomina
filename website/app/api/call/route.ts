import { NextRequest, NextResponse } from "next/server";
import { formatToE164 } from "@/lib/phone";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { phone_number } = body;
    try {
        const webhookUrl = "https://hook.eu1.make.com/6d52cznd3berpbtl1odkr5gvho05bnez";
        console.log("Webhook URL:", webhookUrl);

        if (!webhookUrl) {
            console.error("Erreur de configuration : Webhook introuvable.");
            return NextResponse.json({ message: "Erreur de configuration : Webhook introuvable." }, { status: 500 });
        }

        const formattedPhone = formatToE164(phone_number);

        const payload = {
            phone_number: formattedPhone,

        };
        console.log("Sending payload:", payload);

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        console.log("Response status:", response.status);
        const responseText = await response.text();
        console.log("Response text:", responseText);

        if (response.ok) {
            return NextResponse.json({ message: "Appel déclenché avec succès" });
        } else {
            return NextResponse.json({ message: `Erreur (${response.status}): ${responseText}` }, { status: response.status });
        }
    } catch (error) {
        console.error("Error triggering interview:", error);
        return NextResponse.json({ message: `Erreur technique: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }
}