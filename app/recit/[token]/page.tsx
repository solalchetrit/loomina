import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import PrintedPage from "@/components/ui/PrintedPage";
import { CheckoutFooter } from "@/components/order/CheckoutBar";
import RecitEmailForm from "./RecitEmailForm";
import { getDemoStory, isExpired, storyTeaser } from "@/lib/loomina/demo-story";
import { DEMO_PREVIEW, type DemoPreview } from "./preview";
import { SITE } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Votre récit",
  robots: { index: false, follow: false },
};

/** Le début du récit, une centaine de mots : assez pour remplir la page, qui s'efface ensuite. */
function storyParagraphs(content: string, max = 110): string[] {
  const out: string[] = [];
  let count = 0;
  for (const p of storyTeaser(content, 4)) {
    const words = p.split(/\s+/);
    if (count + words.length > max) {
      out.push(words.slice(0, Math.max(8, max - count)).join(" "));
      break;
    }
    out.push(p);
    count += words.length;
  }
  return out;
}

/**
 * La page du lien envoyé par SMS après la démonstration (demande de Solal,
 * 18/11/2026) : le début du récit dans la page du livre, puis l'e-mail pour
 * recevoir le récit complet, mis en page, en PDF.
 */
export default async function RecitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // Aperçu pour le Navigateur Claude : un récit d'exemple, sans base.
  const story: DemoPreview | null =
    token === "apercu" ? DEMO_PREVIEW : await getDemoStory(token).catch(() => null);
  const valid = story && story.status === "written" && story.content && !isExpired(story.created_at);

  return (
    <div className="min-h-svh bg-[var(--canvas)]">
      <div className="mx-auto flex h-16 w-full max-w-[1080px] items-center px-5 sm:h-20">
        <Link href="/" aria-label="Loomina, accueil" className="relative block h-7 w-[118px] sm:h-8 sm:w-[134px]">
          <Image src="/header-logo-trimmed.png" alt="" fill className="object-contain object-left" priority sizes="134px" />
        </Link>
      </div>

      {valid ? (
        <main className="mx-auto grid w-full max-w-[1080px] gap-8 px-5 pb-12 pt-4 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-0 lg:pt-10">
          <div className="lg:col-start-2 lg:self-end">
            <p className="t-eyebrow">Votre récit est écrit</p>
            <h1 className="t-display mt-3">
              {story.first_name ? `${story.first_name}, voici` : "Voici"} le début de votre histoire.
            </h1>
          </div>
          <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
            <PrintedPage chapter="Chapitre 1" title={story.title ?? "Un souvenir"} page="1" sizes="(min-width: 1024px) 540px, 100vw">
              {/* Le début du récit, qui s'efface : la suite arrive par e-mail. */}
              <div style={{ maskImage: "linear-gradient(to bottom, #000 35%, transparent 92%)", WebkitMaskImage: "linear-gradient(to bottom, #000 35%, transparent 92%)" }}>
                {storyParagraphs(story.content ?? "").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </PrintedPage>
          </div>
          <div className="lg:col-start-2 lg:self-start lg:pt-5">
            <p className="t-lead">
              À partir de notre conversation au téléphone, Loomina a écrit « {story.title} », comme le premier chapitre de
              votre livre. Recevez-le en entier, mis en page comme il le serait à l’impression.
            </p>
            <RecitEmailForm token={token} preview={token === "apercu"} />
          </div>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-[640px] px-5 pb-16 pt-10">
          <h1 className="t-display">Ce lien n’est plus valable.</h1>
          <p className="t-lead mt-5">
            Les récits écrits pendant un essai sont gardés 30 jours. Pour en écrire un nouveau, rappelez-nous : cinq minutes
            suffisent.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={`tel:${SITE.phone}`} size="lg">
              Appeler le {SITE.phoneDisplay}
            </Button>
            <Button href="/" variant="secondary" size="lg">
              Découvrir Loomina
            </Button>
          </div>
        </main>
      )}

      {valid && (
        <section className="mx-auto w-full max-w-[1080px] px-5 pb-10">
          <div className="flex flex-col gap-5 rounded-[28px] bg-[var(--ink)] px-7 py-9 text-white sm:px-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="t-banner text-white">Et si c’était toute votre vie ?</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-[#cfcfc8]">
                Appel après appel, à votre rythme, chaque souvenir devient un chapitre, puis un livre à transmettre.
              </p>
            </div>
            <Button href="/order" size="lg" className="gloss">
              Commencer mon livre
            </Button>
          </div>
        </section>
      )}
      <CheckoutFooter />
    </div>
  );
}
