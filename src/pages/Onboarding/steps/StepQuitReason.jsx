import React from 'react'

const REASONS = [
    { id: 'boredom', label: '😴 Got bored' },
    { id: 'burnout', label: '🔥 Burned out' },
    { id: 'no-time', label: '⏰ No time' },
    { id: 'no-results', label: '📉 No results' },
    { id: 'injury', label: '🩹 Got injured' },
    { id: 'motivation', label: '😞 Lost motivation' },
    { id: 'life-event', label: '🌪️ Life got in the way' },
    { id: 'cost', label: '💸 Too expensive' },
]

export default function StepQuitReason({ profile, updateProfile }) {
    const chips = profile.quitReasonChips || []

    function toggleChip(id) {
        if (chips.includes(id)) {
            updateProfile({ quitReasonChips: chips.filter((c) => c !== id) })
        } else {
            updateProfile({ quitReasonChips: [...chips, id] })
        }
    }

    return (
        <div>
            <h2 className="step-title">What made you quit last time?</h2>
            <p className="step-subtitle">
                This is the question no other app asks. Your answer helps us build a plan you'll actually stick to.
            </p>

            <div className="chip-group" style={{ marginBottom: 'var(--space-6)' }}>
                {REASONS.map((r) => (
                    <button
                        key={r.id}
                        className={`chip ${chips.includes(r.id) ? 'active' : ''}`}
                        onClick={() => toggleChip(r.id)}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            <div className="step-form-group">
                <label className="input-label">Anything else? (optional)</label>
                <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Tell us more about why you stopped..."
                    value={profile.quitReason}
                    onChange={(e) => updateProfile({ quitReason: e.target.value })}
                    style={{ resize: 'vertical' }}
                />
            </div>
        </div>
    )
}
