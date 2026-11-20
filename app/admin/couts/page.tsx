import { redirect } from "next/navigation";

/** Ancienne adresse : les coûts sont dans « Argent » depuis le 20/11/2026. */
export default async function OldCosts({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  const { periode } = await searchParams;
  redirect(periode ? `/admin/argent?periode=${encodeURIComponent(periode)}` : "/admin/argent");
}
