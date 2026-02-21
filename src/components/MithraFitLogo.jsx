import React from 'react'

/**
 * MithraFit brand logo
 * variant: 'mark'  — icon only (for collapsed sidebar)
 * variant: 'full'  — icon + "MithraFit" wordmark (for header)
 */
export default function MithraFitLogo({ variant = 'mark', height = 36, className = '' }) {
    const id = `mf-grad-${variant}`
    const iconH = height
    const iconW = iconH * (42 / 48)   // aspect ratio of the M-mark

    return (
        <span className={`mf-logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: variant === 'full' ? '8px' : 0 }}>
            {/* ── M-mark with upward arrow ── */}
            <svg width={iconW} height={iconH} viewBox="0 0 42 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                    <linearGradient id={id} x1="0" y1="0" x2="42" y2="48" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#00D4FF" />
                        <stop offset="100%" stopColor="#0066FF" />
                    </linearGradient>
                </defs>
                {/*
                    M shape: two outer legs + inner V valley.
                    Arrow pointing up sits between the two peaks.
                */}
                {/* Left outer leg */}
                <path
                    d="M2 46 L2 18 L12 30 L21 10 L30 30 L40 18 L40 46"
                    stroke={`url(#${id})`}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                {/* Arrow shaft */}
                <line x1="21" y1="10" x2="21" y2="2" stroke={`url(#${id})`} strokeWidth="4" strokeLinecap="round" />
                {/* Arrow head */}
                <polyline
                    points="15,8 21,2 27,8"
                    stroke={`url(#${id})`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>

            {/* ── Wordmark ── */}
            {variant === 'full' && (
                <svg height={iconH * 0.55} viewBox="0 0 130 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MithraFit">
                    <defs>
                        <linearGradient id={`${id}-text`} x1="0" y1="0" x2="130" y2="0" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#CBD5E1" />
                            <stop offset="100%" stopColor="#94A3B8" />
                        </linearGradient>
                        <linearGradient id={`${id}-text-fit`} x1="0" y1="0" x2="130" y2="0" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#00D4FF" />
                            <stop offset="100%" stopColor="#0066FF" />
                        </linearGradient>
                    </defs>
                    {/* "Mithra" in light grey */}
                    <text
                        x="0" y="22"
                        fontFamily="'Inter', 'Outfit', system-ui, sans-serif"
                        fontWeight="700"
                        fontSize="22"
                        fill={`url(#${id}-text)`}
                        letterSpacing="-0.5"
                    >Mithra</text>
                    {/* "Fit" in gradient blue */}
                    <text
                        x="74" y="22"
                        fontFamily="'Inter', 'Outfit', system-ui, sans-serif"
                        fontWeight="900"
                        fontSize="22"
                        fill={`url(#${id}-text-fit)`}
                        letterSpacing="-0.5"
                    >Fit</text>
                </svg>
            )}
        </span>
    )
}
