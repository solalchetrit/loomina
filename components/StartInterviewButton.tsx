"use client";

import { useState } from "react";
import Button from "./ui/Button";


export default function StartInterviewButton({ phone }: { phone: string; userName: string }) {
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
            <div role="status" className="rounded-2xl border border-[var(--success)]/30 bg-[var(--success)]/5 px-4 py-3 font-sans text-[14px] text-[var(--success)]">
                <p className="font-semibold">Appel déclenché.</p>
                <p>Votre téléphone devrait sonner d&apos;un instant à l&apos;autre.</p>
            </div>
        );
    }

    return (
        <>
            <Button
                onClick={handleStartInterview}
                loading={loading}
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
            >
                {loading ? "Déclenchement…" : "Me faire appeler maintenant"}
            </Button>
            {error && (
                <p role="alert" className="mt-2 font-sans text-[13px] text-[var(--danger)]">{error}</p>
            )}
        </>
    );
}
