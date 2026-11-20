import { redirect } from "next/navigation";

/** Ancienne adresse : « Suivi client » et « Clients » ne font plus qu'une page depuis le 20/11/2026. */
export default async function OldSuivi({ searchParams }: { searchParams: Promise<{ fait?: string; erreur?: string }> }) {
  const sp = await searchParams;
  const q = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]).toString();
  redirect(`/admin/clients${q ? `?${q}` : ""}`);
}
