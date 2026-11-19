"use client";

import LogoMotion from "@/components/brand/LogoMotion";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import CheckoutBar, { CheckoutFooter } from "@/components/order/CheckoutBar";
import Icon, { type IconName } from "@/components/ui/Icon";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";
import { trackWhenReady } from "@/lib/analytics";

/** Même clé que l'espace auteur (app/dashboard) : confort d'affichage seulement. */
const STORAGE_KEY = "loomina_user_phone";

type Info = {
  ready: boolean;
  isGift: boolean;
  space: "auteur" | "famille";
  firstName: string;
  giverFirstName: string;
  phone: string;
  authorPhone: string;
};

type Slide = { icon: IconName; eyebrow: string; title: string; body: React.ReactNode };

/**
 * Bienvenue et prise en main, juste après la commande (demande de Solal, 18/11/2026).
 *
 * Stripe renvoie ici avec l'identifiant du paiement. /api/bienvenue vérifie le
 * paiement, attend que le livre soit créé (webhook) puis pose la session : le
 * bouton final ouvre directement l'espace auteur, ou l'espace famille pour la
 * personne qui offre, sans code SMS.
 */
export default function BienvenuePage() {
  const [info, setInfo] = useState<Info | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "slow" | "invalid">("loading");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      const id = window.setTimeout(() => setState("invalid"), 0);
      return () => window.clearTimeout(id);
    }
    trackWhenReady("purchase", {
      transaction_id: sessionId,
      currency: "EUR",
      value: OFFER.price,
      items: [{ item_id: "livre", item_name: OFFER.name, price: OFFER.price, quantity: 1 }],
    });

    let stopped = false;
    let tries = 0;
    const poll = async () => {
      tries += 1;
      try {
        const res = await fetch("/api/bienvenue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (res.status === 404) {
          if (!stopped) setState("invalid");
          return;
        }
        const data = (await res.json().catch(() => null)) as Info | null;
        if (data) setInfo(data);
        if (data?.ready) {
          try {
            localStorage.setItem(STORAGE_KEY, data.phone);
          } catch {
            /* stockage indisponible : l'espace s'ouvre quand même grâce au cookie */
          }
          if (!stopped) setState("ready");
          return;
        }
      } catch {
        /* réseau : on réessaie */
      }
      // Le livre est créé en quelques secondes ; au-delà d'une minute, on rassure.
      if (tries === 30 && !stopped) setState((s) => (s === "loading" ? "slow" : s));
      if (!stopped && tries < 90) window.setTimeout(poll, 2000);
    };
    poll();
    return () => {
      stopped = true;
    };
  }, []);

  const name = info?.firstName || "";
  const giver = info?.giverFirstName || "";
  const gift = Boolean(info?.isGift);

  const message = `Je t’ai offert un livre de ta vie avec Loomina. Il suffit d’appeler le ${SITE.phoneDisplay}, depuis ton téléphone habituel, quand tu en as envie : une voix te posera des questions sur tes souvenirs, et ils deviendront un vrai livre.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* presse-papiers refusé : le texte reste affiché */
    }
  };

  // « ***1298 » → « (celui qui finit par 1298) »
  const last4 = (info?.authorPhone ?? "").replace(/\D/g, "");
  const ends = last4 ? ` (celui qui finit par ${last4})` : "";

  const phoneLine = (
    <a href={`tel:${SITE.phone}`} className="link whitespace-nowrap font-semibold">
      {SITE.phoneDisplay}
    </a>
  );

  const slides: Slide[] = gift
    ? [
        {
          icon: "gift",
          eyebrow: "Commande confirmée",
          title: giver ? `Merci, ${giver}.` : "Merci pour ce cadeau.",
          body: (
            <>
              Le livre de {name || "votre proche"} est commandé. Un e-mail de confirmation vient de partir. Voici, en trois étapes, comment les choses vont se passer.
            </>
          ),
        },
        {
          icon: "phone",
          eyebrow: "Étape 1",
          title: `Prévenez ${name || "votre proche"}`,
          body: (
            <>
              Tout se passe au téléphone. {name || "Votre proche"} appelle le {phoneLine} depuis le numéro indiqué à la commande{ends} : Loomina reconnaît ce numéro, se présente et commence par les premiers souvenirs. Vous pouvez lui envoyer ce message :
              <span className="mt-4 block rounded-[16px] bg-[var(--canvas)] p-4 text-[16px] italic">{message}</span>
              <button type="button" onClick={copy} className="link mt-3 text-[16px] font-semibold">
                {copied ? "Message copié" : "Copier le message"}
              </button>
            </>
          ),
        },
        {
          icon: "heart",
          eyebrow: "Étape 2",
          title: "Suivez le livre depuis votre espace famille",
          body: (
            <>
              Après chaque appel, Loomina écrit un nouveau passage. Dans votre espace famille, vous voyez le livre avancer et vous pouvez souffler à Loomina des souvenirs ou des questions à aborder. Pour y revenir plus tard, il suffit de votre numéro de portable et d’un code par SMS.
            </>
          ),
        },
        {
          icon: "book",
          eyebrow: "Étape 3",
          title: "Le livre arrive chez vous",
          body: (
            <>
              Quand l’histoire est complète, chaque page est relue par une personne de l’équipe, puis le livre ({OFFER.format}) est imprimé et livré. Une version numérique l’accompagne.
            </>
          ),
        },
      ]
    : [
        {
          icon: "check",
          eyebrow: "Commande confirmée",
          title: name ? `Bienvenue, ${name}.` : "Bienvenue chez Loomina.",
          body: (
            <>
              Votre livre est commandé et un e-mail de confirmation vient de partir. Voici, en trois étapes, comment nous allons l’écrire ensemble.
            </>
          ),
        },
        {
          icon: "phone",
          eyebrow: "Étape 1",
          title: "Vous racontez, au téléphone",
          body: (
            <>
              Appelez le {phoneLine} depuis le numéro indiqué à la commande{ends}, quand vous en avez envie. Loomina vous reconnaît, se présente et vous pose des questions sur votre vie, une période à la fois. Chaque appel dure le temps que vous avez choisi, et vous rappelez aussi souvent que vous voulez.
            </>
          ),
        },
        {
          icon: "pen",
          eyebrow: "Étape 2",
          title: "Loomina écrit, vous relisez",
          body: (
            <>
              Après chaque appel, le récit apparaît dans votre espace auteur. Vous le relisez, vous demandez une correction, vous ajoutez des photos. Rien n’est imprimé sans votre accord.
            </>
          ),
        },
        {
          icon: "book",
          eyebrow: "Étape 3",
          title: "Votre livre arrive chez vous",
          body: (
            <>
              Une personne de l’équipe relit chaque page, puis le livre ({OFFER.format}) est imprimé et livré chez vous, avec sa version numérique. Dans votre espace, commencez par dire à Loomina comment vous parler : tutoiement ou vouvoiement, sujets à éviter.
            </>
          ),
        },
      ];

  const last = index === slides.length - 1;
  const slide = slides[index];

  const openSpace = () => {
    router.push("/dashboard");
  };

  if (state === "invalid") {
    return (
      <Shell>
        <p className="t-eyebrow">Bienvenue</p>
        <h1 className="t-title mt-3">Retrouvez votre livre</h1>
        <p className="t-body mt-4 max-w-xl">
          Ce lien de bienvenue n’est plus valable. Votre commande, elle, est bien enregistrée si vous avez reçu l’e-mail de confirmation. Connectez-vous avec votre numéro de téléphone : un code vous arrive par SMS.
        </p>
        <div className="mt-8">
          <Button href="/dashboard" size="lg">Ouvrir mon espace</Button>
        </div>
      </Shell>
    );
  }

  if (state !== "ready" || !info) {
    return (
      <Shell>
        <LogoMotion name="persoEcrit" mode="loop" className="mb-5 h-24 w-24" />
        <p className="t-eyebrow">Paiement reçu</p>
        <h1 className="t-title mt-3">Nous préparons votre espace…</h1>
        <p className="t-body mt-4 max-w-xl" role="status">
          {state === "slow"
            ? "C’est un peu plus long que d’habitude. Votre commande est bien enregistrée : vous pouvez garder cette page ouverte, ou revenir plus tard et vous connecter avec votre numéro de téléphone."
            : "Quelques secondes : nous créons votre livre et votre espace."}
        </p>
        <div className="mt-8 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-[var(--canvas)]">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[var(--amber)]" />
        </div>
        {state === "slow" && (
          <div className="mt-8">
            <Button href="/dashboard" variant="secondary">Me connecter avec mon numéro</Button>
          </div>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <ol className="flex items-center gap-2" aria-label="Progression">
        {slides.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${s.eyebrow} : ${s.title}`}
              aria-current={i === index ? "step" : undefined}
              className={`block h-2 rounded-full transition-all ${i === index ? "w-8 bg-[var(--ink)]" : i < index ? "w-2 bg-[var(--amber)]" : "w-2 bg-[var(--rule-strong)]"}`}
            />
          </li>
        ))}
      </ol>

      <div key={index} className="rise mt-8">
        {index === 0 ? (
          // Premier écran après l'achat : l'Étincelle fête la commande.
          <LogoMotion name="persoFete" mode="loop" className="h-24 w-24" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--amber-wash)] text-[var(--amber-ink)]">
            <Icon name={slide.icon} size={26} />
          </span>
        )}
        <p className="t-eyebrow mt-6">{slide.eyebrow}</p>
        <h1 className="t-title mt-2">{slide.title}</h1>
        <div className="t-body mt-4 max-w-xl">{slide.body}</div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        {last ? (
          <Button size="lg" onClick={openSpace}>
            {info.space === "famille" ? "Ouvrir mon espace famille" : "Ouvrir mon espace auteur"}
          </Button>
        ) : (
          <Button size="lg" onClick={() => setIndex(index + 1)}>
            {index === 0 ? "Découvrir comment ça marche" : "Suivant"}
          </Button>
        )}
        {index > 0 && (
          <Button variant="ghost" onClick={() => setIndex(index - 1)}>
            Retour
          </Button>
        )}
        {!last && (
          <button type="button" onClick={openSpace} className="link ml-auto text-[16px]">
            Passer, ouvrir mon espace
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <CheckoutBar />
      <div className="flex-1 px-4 pb-6 sm:px-6">
        <div className="mx-auto w-full max-w-[640px]">
          <div className="card card-float p-6 sm:p-10">{children}</div>
        </div>
      </div>
      <CheckoutFooter />
    </div>
  );
}
