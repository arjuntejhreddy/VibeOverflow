import React, { useEffect, useState } from 'react'

export default function ArchetypeReveal({ archetype, onContinue }) {
    const [phase, setPhase] = useState(0)

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase(1), 300),
            setTimeout(() => setPhase(2), 800),
            setTimeout(() => setPhase(3), 1500),
        ]
        return () => timers.forEach(clearTimeout)
    }, [])

    if (!archetype) return null

    return (
        <div className="archetype-reveal">
            <div
                className="archetype-reveal"
                style={{ '--archetype-color': archetype.color }}
            >
                <style>{`
          .archetype-reveal::before {
            background: radial-gradient(circle, ${archetype.color}44 0%, transparent 70%);
          }
        `}</style>

                {phase >= 1 && (
                    <div
                        className="archetype-badge"
                        style={{ background: `${archetype.color}22`, border: `2px solid ${archetype.color}` }}
                    >
                        {archetype.emoji}
                    </div>
                )}

                {phase >= 1 && (
                    <div className="archetype-label">You are</div>
                )}

                {phase >= 2 && (
                    <h1
                        className="archetype-name"
                        style={{ color: archetype.color }}
                    >
                        {archetype.name}
                    </h1>
                )}

                {phase >= 2 && (
                    <p className="archetype-tagline">"{archetype.tagline}"</p>
                )}

                {phase >= 3 && (
                    <>
                        <p className="archetype-description">{archetype.description}</p>

                        <div className="archetype-traits">
                            {archetype.strengths.map((s) => (
                                <span
                                    key={s}
                                    className="archetype-trait"
                                    style={{ background: `${archetype.color}22`, color: archetype.color }}
                                >
                                    ✦ {s}
                                </span>
                            ))}
                        </div>

                        <div className="archetype-cta">
                            <button className="btn btn-primary btn-lg" onClick={onContinue}>
                                Let's Build Your Plan →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
