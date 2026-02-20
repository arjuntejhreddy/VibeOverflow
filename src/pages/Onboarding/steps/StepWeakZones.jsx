import React from 'react'

const ZONES = [
    { id: 'chest', label: 'Chest' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'arms', label: 'Arms' },
    { id: 'core', label: 'Core / Abs' },
    { id: 'upper-back', label: 'Upper Back' },
    { id: 'lower-back', label: 'Lower Back' },
    { id: 'glutes', label: 'Glutes' },
    { id: 'quads', label: 'Quads' },
    { id: 'hamstrings', label: 'Hamstrings' },
    { id: 'calves', label: 'Calves' },
    { id: 'flexibility', label: 'Flexibility' },
    { id: 'cardio', label: 'Cardio / Endurance' },
]

export default function StepWeakZones({ profile, updateProfile }) {
    const weakZones = profile.weakZones || []

    function toggle(id) {
        if (weakZones.includes(id)) {
            updateProfile({ weakZones: weakZones.filter((z) => z !== id) })
        } else {
            updateProfile({ weakZones: [...weakZones, id] })
        }
    }

    return (
        <div>
            <h2 className="step-title">Where are you weakest?</h2>
            <p className="step-subtitle">
                Select the areas you want to improve most. We'll prioritize these in your training plan.
            </p>

            <div className="injury-grid">
                {ZONES.map((zone) => (
                    <button
                        key={zone.id}
                        className={`injury-chip ${weakZones.includes(zone.id) ? 'selected' : ''}`}
                        onClick={() => toggle(zone.id)}
                        style={weakZones.includes(zone.id) ? {
                            background: 'rgba(124, 58, 237, 0.15)',
                            borderColor: 'var(--color-primary)',
                            color: 'var(--color-primary-light)',
                        } : {}}
                    >
                        {zone.label}
                    </button>
                ))}
            </div>

            {weakZones.length > 0 && (
                <p style={{
                    textAlign: 'center',
                    color: 'var(--color-primary-light)',
                    marginTop: 'var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                }}>
                    {weakZones.length} zone{weakZones.length > 1 ? 's' : ''} selected
                </p>
            )}
        </div>
    )
}
