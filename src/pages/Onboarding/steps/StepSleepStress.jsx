import React from 'react'

const STRESS_LABELS = ['😌 Very Low', '🙂 Low', '😐 Moderate', '😰 High', '🤯 Very High']

export default function StepSleepStress({ profile, updateProfile }) {
    return (
        <div>
            <h2 className="step-title">Sleep & stress</h2>
            <p className="step-subtitle">
                These are the two biggest factors most fitness apps ignore. We don't.
            </p>

            <div className="slider-group">
                <div className="slider-header">
                    <label className="input-label" style={{ marginBottom: 0 }}>Average sleep per night</label>
                    <span className="slider-value">{profile.sleepHours}h</span>
                </div>
                <input
                    className="range-slider"
                    type="range"
                    min="3"
                    max="12"
                    step="0.5"
                    value={profile.sleepHours}
                    onChange={(e) => updateProfile({ sleepHours: Number(e.target.value) })}
                />
            </div>

            <div className="slider-group">
                <div className="slider-header">
                    <label className="input-label" style={{ marginBottom: 0 }}>Daily stress level</label>
                    <span className="slider-value">{STRESS_LABELS[profile.stressLevel - 1]}</span>
                </div>
                <input
                    className="range-slider"
                    type="range"
                    min="1"
                    max="5"
                    value={profile.stressLevel}
                    onChange={(e) => updateProfile({ stressLevel: Number(e.target.value) })}
                />
            </div>
        </div>
    )
}
