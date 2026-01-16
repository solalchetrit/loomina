"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STRIPE_CONFIG } from "@/config/stripe";
import { formatToE164 } from "@/lib/phone";

export default function OrderPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedOption, setSelectedOption] = useState<"me" | "gift" | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        age: "",
        phone: "",
        email: "",
    });

    const handleOptionClick = (option: "me" | "gift") => {
        setSelectedOption(option);
        setStep(2);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const isFormValid =
        formData.firstName.trim() !== "" &&
        formData.lastName.trim() !== "" &&
        formData.age.trim() !== "" &&
        formData.phone.trim() !== "" &&
        formData.email.trim() !== "";

    const handleSubmit = () => {
        if (!isFormValid) return;

        // Format phone to E164 before saving for consistent storage
        const formattedPhone = formatToE164(formData.phone);

        // Save relevant data to localStorage as a JSON object
        const orderData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            isGift: selectedOption === "gift",
            phone: formattedPhone,
            email: formData.email
        };

        localStorage.setItem("loomina_order_data", JSON.stringify(orderData));

        // Redirect to Stripe
        window.location.href = STRIPE_CONFIG.PAYMENT_LINK;
    };

    return (
        <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex flex-col pt-32 pb-20 px-6 relative">
            <div className="max-w-3xl mx-auto w-full flex flex-col items-center space-y-12 relative z-10">

                {/* Header Text */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                        <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                            Commander
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="heading-section font-serif text-[var(--text-primary)]"
                    >
                        À qui se destine cette Biographie ?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto italic font-serif"
                    >
                        &quot;Chaque vie mérite d&apos;être racontée.&quot;
                    </motion.p>
                </div>

                {/* STEP 1: CHOICE */}
                <div className="grid md:grid-cols-2 gap-6 w-full">
                    {/* Option A: Pour moi */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        onClick={() => handleOptionClick("me")}
                        className={`
                            group cursor-pointer rounded-2xl p-8 transition-all duration-300
                            flex flex-col items-center text-center space-y-4
                            ${selectedOption === "me"
                                ? "glass-gold border-2 border-[var(--loomina-gold)]/50"
                                : "glass hover:border-[var(--loomina-gold)]/30"}
                        `}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-[var(--loomina-void)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-serif text-[var(--text-primary)]">C&apos;est pour moi</h3>
                        <p className="text-sm text-[var(--text-secondary)] font-sans">
                            Je veux écrire mon histoire !
                        </p>

                        {/* Checkmark indicator */}
                        <div className={`mt-4 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${selectedOption === "me"
                            ? "bg-[var(--loomina-gold)] border-[var(--loomina-gold)]"
                            : "border-[var(--loomina-mist)]"
                            }`}>
                            {selectedOption === "me" && (
                                <svg className="w-4 h-4 text-[var(--loomina-void)]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    </motion.div>

                    {/* Option B: Cadeau */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        onClick={() => handleOptionClick("gift")}
                        className={`
                            group cursor-pointer rounded-2xl p-8 transition-all duration-300
                            flex flex-col items-center text-center space-y-4
                            ${selectedOption === "gift"
                                ? "glass-gold border-2 border-[var(--loomina-gold)]/50"
                                : "glass hover:border-[var(--loomina-gold)]/30"}
                        `}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--loomina-aurora)] to-[var(--loomina-aurora-light)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-serif text-[var(--text-primary)]">C&apos;est pour offrir</h3>
                        <p className="text-sm text-[var(--text-secondary)] font-sans">
                            Je veux connaître son histoire !
                        </p>

                        {/* Checkmark indicator */}
                        <div className={`mt-4 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${selectedOption === "gift"
                            ? "bg-[var(--loomina-aurora)] border-[var(--loomina-aurora)]"
                            : "border-[var(--loomina-mist)]"
                            }`}>
                            {selectedOption === "gift" && (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* STEP 2: FORM */}
                <AnimatePresence>
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full max-w-xl overflow-hidden"
                        >
                            <div className="pt-8 border-t border-[var(--loomina-mist)] flex flex-col space-y-8">

                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-serif text-[var(--text-primary)]">
                                        {selectedOption === 'gift' ? "Coordonnées du bénéficiaire" : "Vos coordonnées"}
                                    </h2>
                                    <p className="text-[var(--text-secondary)] text-sm">
                                        {selectedOption === 'gift'
                                            ? "La personne qui racontera son histoire."
                                            : "Informations nécessaires pour créer votre espace."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium ml-1">Prénom</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Jean"
                                            className="w-full p-4 rounded-xl bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] focus:border-[var(--loomina-gold)] focus:ring-0 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium ml-1">Nom</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Dupont"
                                            className="w-full p-4 rounded-xl bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] focus:border-[var(--loomina-gold)] focus:ring-0 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium ml-1">Âge</label>
                                        <input
                                            type="text"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 75"
                                            className="w-full p-4 rounded-xl bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] focus:border-[var(--loomina-gold)] focus:ring-0 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium ml-1">Téléphone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 06 12 34 56 78"
                                            className="w-full p-4 rounded-xl bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] focus:border-[var(--loomina-gold)] focus:ring-0 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium ml-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Ex: jean.dupont@email.com"
                                            className="w-full p-4 rounded-xl bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] focus:border-[var(--loomina-gold)] focus:ring-0 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!isFormValid}
                                        className={`
                                            w-full py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3
                                            ${isFormValid
                                                ? "bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)] text-white hover:scale-[1.02] cursor-pointer shadow-lg shadow-[var(--loomina-gold)]/20"
                                                : "bg-[var(--loomina-mist)]/30 text-[var(--text-muted)] cursor-not-allowed"}
                                        `}
                                    >
                                        Procéder au paiement
                                        {isFormValid && (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        )}
                                    </button>
                                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[var(--text-muted)]">
                                        <svg className="w-4 h-4 text-[var(--loomina-gold)]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>Paiement 100% sécurisé via Stripe</span>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
