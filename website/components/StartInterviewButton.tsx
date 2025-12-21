"use client";

import { useState } from "react";
import MagicButton from "./ui/MagicButton";

interface StartInterviewButtonProps {
    phone: string;
    userName: string;
}

export default function StartInterviewButton({ phone, userName }: StartInterviewButtonProps) {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleStartInterview = async () => {
        setLoading(true);
        console.log("Attempting to trigger interview...");
        try {
            const webhookUrl = "https://loomina-flow.onrender.com/call-client";
            console.log("Webhook URL:", webhookUrl);

            if (!webhookUrl) {
                alert("Erreur de configuration : Webhook introuvable.");
                return;
            }

            const payload = {
                phone_number: phone,

            };
            console.log("Sending payload:", payload);

            const response = await fetch("/api/call", {
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
                setSent(true);
            } else {
                alert(`Erreur (${response.status}): ${responseText}`);
            }
        } catch (error) {
            console.error("Error triggering interview:", error);
            alert(`Erreur technique: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="text-center p-4 bg-green-50 text-green-800 rounded-xl border border-green-200">
                <p className="font-medium">Appel déclenché !</p>
                <p className="text-sm">Votre téléphone devrait sonner d'un instant à l'autre.</p>
            </div>
        );
    }

    return (
        <MagicButton
            onClick={handleStartInterview}
            disabled={loading}
            className="w-full md:w-auto"
        >
            {loading ? "Déclenchement..." : "📞 Démarrer l'interview maintenant"}
        </MagicButton>
    );
}
