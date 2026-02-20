import React from 'react'

const PERSONAS = [
    {
        id: 'drill',
        emoji: '🪖',
        name: 'The Drill Sergeant',
        desc: 'Tough love, no excuses. "You said you wanted this. Now prove it."',
        sample: '"Drop and give me 20. No, not 19. TWENTY."',
    },
    {
        id: 'friend',
        emoji: '👯',
        name: 'The Best Friend',
        desc: 'Warm, encouraging, casual. Celebrates every small win with you.',
        sample: '"Hey, you showed up — that\'s already a win! Let\'s crush this together."',
    },
    {
        id: 'zen',
        emoji: '🧘',
        name: 'The Zen Master',
        desc: 'Calm, mindful, focused. Connects breath with movement.',
        sample: '"Inhale strength. Exhale doubt. One more rep — be present with it."',
    },
    {
        id: 'hype',
        emoji: '🔥',
        name: 'The Hype Coach',
        desc: 'Loud, energetic, celebratory. Maximum energy, maximum volume.',
        sample: '"LET\'S GOOO! You are a MACHINE! Three more — EASY MONEY!"',
    },
]

export default function StepCoachPersona({ profile, updateProfile }) {
    return (
        <div>
            <h2 className="step-title">Pick your coach</h2>
            <p className="step-subtitle">
                Same workout, completely different energy. Your coach will speak to you rep-by-rep during workouts.
            </p>

            <div className="persona-grid">
                {PERSONAS.map((p) => (
                    <div
                        key={p.id}
                        className={`persona-card ${profile.coachPersona === p.id ? 'selected' : ''}`}
                        onClick={() => updateProfile({ coachPersona: p.id })}
                    >
                        <div className="persona-emoji">{p.emoji}</div>
                        <div className="persona-name">{p.name}</div>
                        <div className="persona-desc">{p.desc}</div>
                        <div style={{
                            marginTop: 'var(--space-3)',
                            padding: 'var(--space-2) var(--space-3)',
                            background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-tertiary)',
                            fontStyle: 'italic',
                        }}>
                            {p.sample}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
