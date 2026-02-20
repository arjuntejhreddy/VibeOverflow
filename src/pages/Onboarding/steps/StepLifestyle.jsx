import React from 'react'

const JOB_TYPES = [
    { id: 'sedentary', icon: '🖥️', title: 'Sedentary', desc: 'Desk job, mostly sitting' },
    { id: 'mixed', icon: '🚶', title: 'Mixed', desc: 'Some walking, some sitting' },
    { id: 'active', icon: '🏗️', title: 'Active', desc: 'On your feet most of the day' },
]

export default function StepLifestyle({ profile, updateProfile }) {
    return (
        <div>
            <h2 className="step-title">Daily routine</h2>
            <p className="step-subtitle">
                Your job and daily activity affect how we structure your workouts and recovery.
            </p>

            <div className="level-cards" style={{ marginBottom: 'var(--space-8)' }}>
                {JOB_TYPES.map((jt) => (
                    <div
                        key={jt.id}
                        className={`level-card ${profile.jobType === jt.id ? 'selected' : ''}`}
                        onClick={() => updateProfile({ jobType: jt.id })}
                    >
                        <span className="level-icon">{jt.icon}</span>
                        <div className="level-info">
                            <div className="level-title">{jt.title}</div>
                            <div className="level-desc">{jt.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="slider-group">
                <div className="slider-header">
                    <label className="input-label" style={{ marginBottom: 0 }}>Work hours per day</label>
                    <span className="slider-value">{profile.workHours}h</span>
                </div>
                <input
                    className="range-slider"
                    type="range"
                    min="2"
                    max="16"
                    value={profile.workHours}
                    onChange={(e) => updateProfile({ workHours: Number(e.target.value) })}
                />
            </div>
        </div>
    )
}
