"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MemberCard from "@/components/MemberCard";
import Button from "@/components/ui/Button";
import { formatToE164 } from "@/lib/phone";
import { LOOMINA_CONFIG } from "@/config/loomina";

const NEXT_STEPS = [
  { title: "Appelez Loomina", text: "Depuis le numéro indiqué à la commande. Le premier appel fait connaissance et calibre le récit." },
  { title: "Racontez, à votre rythme", text: "Quatorze conversations thématiques. Loomina reprend là où vous vous étiez arrêté." },
  { title: "Relisez chaque chapitre", text: "Vous validez, ajustez, puis le livre part à l’impression." },
];

export default function SuccessPage() {
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; phone?: string } | null>(null);

  useEffect(() => {
    // Retrieve the user's data from storage
    const storedData = localStorage.getItem("loomina_order_data");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        requestAnimationFrame(() => setUserData(parsedData));

        // Sync new client to Supabase
        const syncClient = async () => {
          if (parsedData.phone) {
            try {
              const cleanPhone = formatToE164(parsedData.phone);
              const fullName = `${parsedData.firstName} ${parsedData.lastName}`.trim();
              const { error } = await supabase.from("Client").upsert(
                {
                  name: fullName,
                  first_name: parsedData.firstName,
                  last_name: parsedData.lastName,
                  phone_number: cleanPhone,
                  email: parsedData.email,
                  phase: LOOMINA_CONFIG.PHASES.ONBOARDING,
                },
                { onConflict: "phone_number" }
              );
              if (error) {
                console.error("Supabase sync error:", error);
              } else {
                console.log("Client synced to Supabase successfully.");
              }
            } catch (err) {
              console.error("Error executing Supabase sync:", err);
            }
          }
        };
        syncClient();
      } catch (e) {
        console.error("Failed to parse order data", e);
      }
    }
  }, []);

  return (
    <div className="w-full pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        <div className="rise mx-auto max-w-2xl text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold-ink)] text-white">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12 5 5L20 7" />
            </svg>
          </span>
          <h1 className="heading-section mt-6">
            Paiement confirmé. <em className="text-[var(--gold-ink)]">Bienvenue.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-lg font-sans text-lg leading-relaxed text-[var(--text-secondary)]">
            Votre place est réservée{userData ? `, ${userData.firstName}` : ""}. Voici votre carte membre : elle vous suit tout au long du récit.
          </p>
        </div>

        <div className="settle mx-auto mt-12 max-w-xl" style={{ "--i": 1 } as React.CSSProperties}>
          <MemberCard name={userData ? `${userData.firstName} ${userData.lastName}` : undefined} />
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div className="rise" style={{ "--i": 3 } as React.CSSProperties}>
            <p className="eyebrow">Pour commencer</p>
            <p className="mt-3 font-serif text-[26px] leading-tight tracking-[-0.02em] text-[var(--ink)]">Appelez simplement Loomina.</p>
            <a
              href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`}
              className="press card mt-5 flex items-center gap-4 rounded-3xl p-5 hover:border-[var(--loomina-gold)]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--loomina-gold-light)]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.143-7.143 1.125 1.125 0 0 1 .38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </span>
              <span>
                <span className="block font-serif text-[26px] leading-tight text-[var(--ink)]">{LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}</span>
                <span className="block font-sans text-[13px] text-[var(--text-muted)]">Du lundi au vendredi, 9 h à 18 h</span>
              </span>
            </a>
            <p className="mt-4 font-sans text-[14px] leading-relaxed text-[var(--text-muted)]">
              Ou connectez-vous à votre espace pour que Loomina vous appelle quand vous voulez.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button href="/dashboard" variant="primary" size="md">
                Ouvrir mon espace
              </Button>
              <Button href="/" variant="ghost" size="md">
                Retour à l’accueil
              </Button>
            </div>
          </div>

          <ol className="rise grid gap-px overflow-hidden rounded-3xl bg-[var(--hairline)] shadow-[0_0_0_1px_var(--hairline)]" style={{ "--i": 4 } as React.CSSProperties}>
            {NEXT_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-5 bg-[var(--paper)] p-6">
                <span className="font-serif text-[17px] italic text-[var(--gold-ink)]">0{i + 1}</span>
                <span>
                  <span className="block font-serif text-[20px] leading-tight text-[var(--ink)]">{s.title}</span>
                  <span className="mt-1.5 block font-sans text-[14px] leading-relaxed text-[var(--text-secondary)]">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
