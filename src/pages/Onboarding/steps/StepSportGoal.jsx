import React from 'react'

const SPORTS = [
    'Running', 'Swimming', 'Cycling', 'Weightlifting', 'CrossFit',
    'Boxing / MMA', 'Basketball', 'Football', 'Tennis', 'Cricket', 'Other'
]

const GOALS = [
    'Lose weight', 'Build muscle', 'Get toned', 'Improve endurance',
    'Increase flexibility', 'Feel healthier', 'Stress relief', 'Other'
]

export default function StepSportGoal({ profile, updateProfile }) {
    const isAthlete = profile.path === 'athlete'

    return (
        <div>
            <h2 className="step-title">{isAthlete ? 'What\'s your sport?' : 'What\'s your goal?'}</h2>
            <p className="step-subtitle">
                {isAthlete
                    ? 'Select your primary sport — we\'ll tailor your training specifically for it.'
                    : 'Pick the goal that matters most to you right now.'}
            </p>

            {isAthlete ? (
                <div className="step-form-group">
                    <label className="input-label">Primary Sport</label>
                    <select
                        className="select-field"
                        value={profile.sport}
                        onChange={(e) => updateProfile({ sport: e.target.value })}
                    >
                        <option value="">Select your sport</option>
                        {SPORTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    {profile.sport === 'Other' && (
                        <input
                            className="input-field"
                            placeholder="Tell us your sport..."
                            value={profile.goal}
                            onChange={(e) => updateProfile({ goal: e.target.value })}
                            style={{ marginTop: 'var(--space-3)' }}
                        />
                    )}
                </div>
            ) : (
                <div className="chip-group">
                    {GOALS.map((g) => (
                        <button
                            key={g}
                            className={`chip ${profile.goal === g ? 'active' : ''}`}
                            onClick={() => updateProfile({ goal: g })}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
