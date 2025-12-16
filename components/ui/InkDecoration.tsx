"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface InkParticle {
    id: number;
    x: number;
    y: number;
    scale: number;
    opacity: number;
    rotation: number;
}

export const InkDecoration = () => {
    const [particles, setParticles] = useState<InkParticle[]>([]);

    useEffect(() => {
        // Reduce movement on mobile for performance
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 8 : 15;

        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.3 + 0.1,
            rotation: Math.random() * 360,
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute text-[#D4AF37]/10"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        scale: particle.scale,
                        opacity: particle.opacity,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        rotate: [particle.rotation, particle.rotation + 10, particle.rotation],
                        opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    {/* SVG Ink Drop / Feather Shape */}
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2C12,2 4,10 4,14C4,18.42 7.58,22 12,22C16.42,22 20,18.42 20,14C20,10 12,2 12,2Z" />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

export default InkDecoration;
