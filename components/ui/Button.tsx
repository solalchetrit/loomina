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
    disabled?: boolean;
}

// Icon for primary button
const PrimaryIcon = () => (
    <svg
        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

export default function Button({
    href,
    onClick,
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    fullWidth = false,
    disabled = false
}: ButtonProps) {

    // Size classes
    const sizeClasses = {
        sm: 'px-5 py-2 text-sm gap-2',
        md: 'px-7 py-3 text-sm gap-2',
        lg: 'px-8 py-3.5 text-base gap-3'
    };

    // Variant classes - Premium Dark Theme
    const variantClasses = {
        // Primary: Gold gradient with dark text
        primary: `
            bg-gradient-to-r from-[var(--loomina-gold)] via-[var(--loomina-ember)] to-[var(--loomina-gold-dark)]
            text-[var(--loomina-void)]
            shadow-lg shadow-[var(--loomina-gold)]/20
            hover:shadow-xl hover:shadow-[var(--loomina-gold)]/30
            hover:scale-[1.02]
            active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        `,
        // Secondary: Glass border with gold accent
        secondary: `
            bg-transparent
            text-[var(--loomina-gold)]
            border border-[var(--loomina-gold)]/40
            hover:border-[var(--loomina-gold)]
            hover:bg-[var(--loomina-gold)]/10
            active:scale-[0.98]
        `,
        // Ghost: Minimal with hover effect
        ghost: `
            bg-transparent
            text-[var(--text-secondary)]
            hover:text-[var(--text-primary)]
            hover:bg-[var(--loomina-mist)]/30
            active:scale-[0.98]
        `
    };

    const baseClasses = `
        inline-flex items-center justify-center
        rounded-full
        font-sans font-semibold
        tracking-wide
        cursor-pointer
        select-none
        transition-all duration-300 ease-out
        ${fullWidth ? 'w-full' : ''}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
    `;

    if (href && !disabled) {
        return (
            <Link href={href} className={`group ${baseClasses}`}>
                {children}
                {variant === 'primary' && <PrimaryIcon />}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`group ${baseClasses}`}
            disabled={disabled}
        >
            {children}
            {variant === 'primary' && <PrimaryIcon />}
        </button>
    );
}

