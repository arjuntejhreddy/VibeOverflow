import React from 'react'

const BODY_PARTS = [
    'Neck', 'Shoulders', 'Upper Back', 'Lower Back',
    'Left Knee', 'Right Knee', 'Left Ankle', 'Right Ankle',
    'Left Wrist', 'Right Wrist', 'Left Hip', 'Right Hip',
    'Left Elbow', 'Right Elbow',
]

export default function StepInjuries({ profile, updateProfile }) {
    const injuries = profile.injuries || []

    function toggle(part) {
        if (injuries.includes(part)) {
            updateProfile({ injuries: injuries.filter((p) => p !== part) })
        } else {
            updateProfile({ injuries: [...injuries, part] })
        }
    }

    return (
        <div>
            <h2 className="step-title">Any injuries?</h2>
            <p className="step-subtitle">
                Select any current or recurring injuries. We'll auto-exclude exercises that could aggravate them.
            </p>

            <div className="injury-grid">
                {BODY_PARTS.map((part) => (
                    <button
                        key={part}
                        className={`injury-chip ${injuries.includes(part) ? 'selected' : ''}`}
                        onClick={() => toggle(part)}
                    >
                        {injuries.includes(part) ? '✕ ' : ''}{part}
                    </button>
                ))}
            </div>

            {injuries.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                    No injuries? Amazing — skip ahead! 🎉
                </p>
            )}
        </div>
    )
}
