"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MagicButton from "@/components/ui/MagicButton";
import { STRIPE_CONFIG } from "@/config/stripe";

export default function OrderPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedOption, setSelectedOption] = useState<"me" | "gift" | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        age: "",
        phone: "",
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
        formData.phone.trim() !== "";

    const handleSubmit = () => {
        if (!isFormValid) return;

        // Save relevant data to localStorage as a JSON object
        const orderData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            isGift: selectedOption === "gift",
            phone: formData.phone
        };

        localStorage.setItem("loomina_order_data", JSON.stringify(orderData));

        // Redirect to Stripe
        window.location.href = STRIPE_CONFIG.PAYMENT_LINK;
    };

    return (
        <div className="min-h-screen bg-white text-black selection:bg-[var(--loomina-amber)] selection:text-white flex flex-col pt-32 pb-20 px-6">

            <div className="max-w-3xl mx-auto w-full flex flex-col items-center space-y-12">

                {/* Header Text */}
                <div className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-serif text-black"
                    >
                        À qui se destine cette autobiographie ?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-neutral-500 text-lg max-w-xl mx-auto italic font-serif"
                    >
                        "Chaque vie mérite d'être racontée."
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
                    group cursor-pointer rounded-xl p-8 border transition-all duration-300
                    flex flex-col items-center text-center space-y-4
                    ${selectedOption === "me"
                                ? "bg-neutral-50 border-black shadow-sm"
                                : "bg-white border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"}
                `}
                    >
                        <div className="text-4xl mb-2 opacity-80 group-hover:scale-110 transition-transform duration-300">✒️</div>
                        <h3 className="text-2xl font-serif text-black">C'est pour moi</h3>
                        <p className="text-sm text-neutral-500 font-sans">
                            Je souhaite raconter mon histoire et laisser une trace éternelle.
                        </p>

                        {/* Checkmark indicator */}
                        <div className={`mt-4 w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center transition-colors ${selectedOption === "me" ? "bg-black border-black" : ""}`}>
                            {selectedOption === "me" && <span className="text-white text-xs">✓</span>}
                        </div>
                    </motion.div>

                    {/* Option B: Cadeau */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        onClick={() => handleOptionClick("gift")}
                        className={`
                    group cursor-pointer rounded-xl p-8 border transition-all duration-300
                    flex flex-col items-center text-center space-y-4
                    ${selectedOption === "gift"
                                ? "bg-neutral-50 border-black shadow-sm"
                                : "bg-white border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"}
                `}
                    >
                        <div className="text-4xl mb-2 opacity-80 group-hover:scale-110 transition-transform duration-300">🎁</div>
                        <h3 className="text-2xl font-serif text-black">C'est pour offrir</h3>
                        <p className="text-sm text-neutral-500 font-sans">
                            J'offre ce livre à un proche pour qu'il raconte sa vie.
                        </p>

                        {/* Checkmark indicator */}
                        <div className={`mt-4 w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center transition-colors ${selectedOption === "gift" ? "bg-black border-black" : ""}`}>
                            {selectedOption === "gift" && <span className="text-white text-xs">✓</span>}
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
                            <div className="pt-8 border-t border-neutral-100 flex flex-col space-y-8">

                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-serif text-black">
                                        {selectedOption === 'gift' ? "Coordonnées du bénéficiaire" : "Vos coordonnées"}
                                    </h2>
                                    <p className="text-neutral-500 text-sm">
                                        {selectedOption === 'gift'
                                            ? "La personne qui racontera son histoire."
                                            : "Informations nécessaires pour créer votre espace."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-neutral-500 font-medium ml-1">Prénom</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Jean"
                                            className="w-full p-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:border-black focus:ring-0 outline-none transition-all placeholder:text-neutral-400"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-neutral-500 font-medium ml-1">Nom</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Dupont"
                                            className="w-full p-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:border-black focus:ring-0 outline-none transition-all placeholder:text-neutral-400"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-neutral-500 font-medium ml-1">Âge</label>
                                        <input
                                            type="text"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 75"
                                            className="w-full p-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:border-black focus:ring-0 outline-none transition-all placeholder:text-neutral-400"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-neutral-500 font-medium ml-1">Téléphone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 06 12 34 56 78"
                                            className="w-full p-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:border-black focus:ring-0 outline-none transition-all placeholder:text-neutral-400"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!isFormValid}
                                        className={`
                                    w-full py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-xl
                                    ${isFormValid
                                                ? "bg-black text-white hover:scale-[1.02] cursor-pointer"
                                                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"}
                                `}
                                    >
                                        Procéder au paiement
                                    </button>
                                    <p className="text-center text-xs text-neutral-400 mt-4">
                                        Paiement 100% sécurisé via Stripe.
                                    </p>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
