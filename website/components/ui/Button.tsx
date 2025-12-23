'use client';

import React from 'react';
import Link from 'next/link';

interface ButtonProps {
    href?: string;
    onClick?: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    fullWidth?: boolean;
}

export default function Button({
    href,
    onClick,
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    fullWidth = false
}: ButtonProps) {

    // Size classes - REDUCED for better proportions
    const sizeClasses = {
        sm: 'px-5 py-2 text-sm',
        md: 'px-7 py-2.5 text-base',
        lg: 'px-8 py-3 text-base'
    };

    // Variant classes - SIMPLE ET PREMIUM
    const variantClasses = {
        // Primary: Noir élégant avec hover doré subtil
        primary: `
            bg-[var(--loomina-ink)] text-white
            border-2 border-[var(--loomina-ink)]
            hover:bg-[var(--loomina-gold)] hover:border-[var(--loomina-gold)]
            shadow-md hover:shadow-lg
            transition-all duration-300 ease-out
        `,
        // Secondary: Bordure dorée avec hover rempli
        secondary: `
            bg-transparent text-[var(--loomina-gold)]
            border-2 border-[var(--loomina-gold)]
            hover:bg-[var(--loomina-gold)] hover:text-white
            shadow-sm hover:shadow-md
            transition-all duration-300 ease-out
        `,
        // Ghost: Transparent avec hover subtil
        ghost: `
            bg-transparent text-[var(--loomina-ink)]
            border-2 border-transparent
            hover:border-[var(--loomina-gold)] hover:text-[var(--loomina-gold)]
            transition-all duration-300 ease-out
        `
    };

    const baseClasses = `
        inline-flex items-center justify-center
        rounded-full
        font-sans font-medium
        tracking-wide
        cursor-pointer
        select-none
        ${fullWidth ? 'w-full' : ''}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
    `;

    if (href) {
        return (
            <Link href={href} className={baseClasses}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={baseClasses}>
            {children}
        </button>
    );
}
