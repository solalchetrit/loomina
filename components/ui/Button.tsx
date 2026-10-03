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
    type?: 'button' | 'submit';
    loading?: boolean;
}

// Icon for primary button
const PrimaryIcon = () => (
    <svg
        className="w-4 h-4 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5"
        aria-hidden="true"
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
    disabled = false,
    type = 'button',
    loading = false
}: ButtonProps) {

    // Size classes
    const sizeClasses = {
        sm: 'h-9 px-4 text-sm gap-2',
        md: 'h-11 px-6 text-[15px] gap-2',
        lg: 'h-13 px-7 text-base gap-2.5'
    };

    // Variants — encre profonde + or en accent (refonte 2026)
    const variantClasses = {
        // Primary: encre, texte crème
        primary: `
            bg-[var(--ink)]
            text-[var(--loomina-void)]
            shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_24px_-12px_rgba(26,24,21,0.45)]
            hover:bg-[var(--ink-soft)]
            disabled:opacity-50 disabled:cursor-not-allowed
        `,
        // Secondary: contour discret
        secondary: `
            bg-[var(--paper)]
            text-[var(--text-primary)]
            border border-[var(--hairline-strong)]
            hover:border-[var(--loomina-gold)]
            hover:text-[var(--gold-ink)]
        `,
        // Ghost: minimal
        ghost: `
            bg-transparent
            text-[var(--text-secondary)]
            hover:text-[var(--text-primary)]
            hover:bg-[var(--loomina-mist)]/30
        `
    };

    const baseClasses = `
        press
        inline-flex items-center justify-center
        rounded-full
        font-sans font-semibold
        tracking-[-0.01em]
        cursor-pointer
        select-none
        whitespace-nowrap
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
            type={type}
            onClick={onClick}
            className={`group ${baseClasses}`}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
        >
            {loading && <span className={`spinner ${variant === 'primary' ? 'spinner-light' : ''}`} aria-hidden="true" />}
            {children}
            {variant === 'primary' && !loading && <PrimaryIcon />}
        </button>
    );
}

