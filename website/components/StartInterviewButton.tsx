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
    const [error, setError] = useState<string | null>(null);

    const handleStartInterview = async () => {
        setLoading(true);
        console.log("Attempting to trigger interview...");
        try {
            // We call our internal API route which handles the webhook logic
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
                setError(`Erreur (${response.status}): ${responseText}`);
                console.error(`Erreur (${response.status}): ${responseText}`);
            }
        } catch (error) {
            console.error("Error triggering interview:", error);
            setError(`Erreur technique: ${error instanceof Error ? error.message : String(error)}`);
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
        <>
            <MagicButton
                onClick={handleStartInterview}
                disabled={loading}
                className="w-full md:w-auto"
            >
                {loading ? "Déclenchement..." : "📞 Démarrer l'interview maintenant"}
            </MagicButton>
            {error && (
                <p className="text-red-500 text-xs mt-2">{error}</p>
            )}
        </>
    );
}
