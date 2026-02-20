import React from 'react'

export default function StepCompetition({ profile, updateProfile }) {
    return (
        <div>
            <h2 className="step-title">Competition date</h2>
            <p className="step-subtitle">
                Your training plan will periodize backwards from this date — building base, peaking at the right moment, then tapering.
            </p>

            <div className="step-form-group">
                <label className="input-label">When is your competition?</label>
                <input
                    className="input-field"
                    type="date"
                    value={profile.competitionDate}
                    onChange={(e) => updateProfile({ competitionDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ colorScheme: 'dark' }}
                />
            </div>

            {profile.competitionDate && (() => {
                const diff = Math.ceil((new Date(profile.competitionDate) - new Date()) / (1000 * 60 * 60 * 24))
                const weeks = Math.floor(diff / 7)
                return (
                    <div className="glass-card" style={{
                        padding: 'var(--space-6)',
                        textAlign: 'center',
                        marginTop: 'var(--space-4)',
                    }}>
                        <div style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-accent)' }}>
                            {weeks} weeks
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                            {diff} days until competition
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
