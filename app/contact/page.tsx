"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MagicButton from "@/components/ui/MagicButton";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white text-black flex flex-col">
            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="mx-auto max-w-xl space-y-8">

                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-serif">Nous écrire</h1>
                        <p className="text-neutral-500 font-light">
                            Une question sur votre projet de livre ? Notre équipe vous répond sous 24h.
                        </p>
                    </div>

                    {/* Formulaire simple qui ouvre le client mail de l'utilisateur */}
                    <form
                        className="space-y-6 bg-neutral-50 p-8 rounded-2xl border border-black/5"
                        action="mailto:contact@loomina.fr"
                        method="post"
                        encType="text/plain"
                    >
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium uppercase tracking-wide text-neutral-400">Votre Nom</label>
                            <input required type="text" id="name" name="nom" className="w-full bg-white border border-neutral-200 rounded-lg p-3 outline-none focus:border-[var(--loomina-amber)] transition-colors" placeholder="Jean Dupont" />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium uppercase tracking-wide text-neutral-400">Votre Email</label>
                            <input required type="email" id="email" name="email" className="w-full bg-white border border-neutral-200 rounded-lg p-3 outline-none focus:border-[var(--loomina-amber)] transition-colors" placeholder="jean@exemple.com" />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium uppercase tracking-wide text-neutral-400">Votre Message</label>
                            <textarea required id="message" name="message" rows={6} className="w-full bg-white border border-neutral-200 rounded-lg p-3 outline-none focus:border-[var(--loomina-amber)] transition-colors" placeholder="Bonjour, je souhaiterais en savoir plus sur..." />
                        </div>

                        <MagicButton
                            type="submit"
                            className="w-full justify-center"
                            variant="primary"
                            size="lg"
                        >
                            Envoyer mon message
                        </MagicButton>
                    </form>

                    <div className="text-center pt-8 border-t border-neutral-100">
                        <p className="text-xs text-neutral-400 mb-2">OU APPELEZ-NOUS DIRECTEMENT</p>
                        <a href="tel:+33159169357" className="text-xl font-serif hover:text-[var(--loomina-amber)] transition-colors">
                            01 59 16 93 57
                        </a>
                    </div>

                </div>
            </main>
        </div>
    );
}
