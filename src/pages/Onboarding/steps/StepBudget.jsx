import React from 'react'

export default function StepBudget({ profile, updateProfile }) {
    const formatBudget = (val) => {
        if (val == 0) return 'Free'
        if (val >= 200) return '$200+'
        return `$${val}`
    }

    return (
        <div>
            <h2 className="step-title">Budget</h2>
            <p className="step-subtitle">
                We'll only suggest equipment and meals that fit your budget. No surprises.
            </p>

            <div className="slider-group">
                <div className="slider-header">
                    <label className="input-label" style={{ marginBottom: 0 }}>Monthly fitness budget</label>
                    <span className="slider-value">{formatBudget(profile.fitnessBudget)}</span>
                </div>
                <input
                    className="range-slider"
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={profile.fitnessBudget}
                    onChange={(e) => updateProfile({ fitnessBudget: Number(e.target.value) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Free</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>$200+</span>
                </div>
            </div>

            <div className="slider-group">
                <div className="slider-header">
                    <label className="input-label" style={{ marginBottom: 0 }}>Weekly nutrition budget</label>
                    <span className="slider-value">{formatBudget(profile.nutritionBudget)}</span>
                </div>
                <input
                    className="range-slider"
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={profile.nutritionBudget}
                    onChange={(e) => updateProfile({ nutritionBudget: Number(e.target.value) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Free</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>$200+</span>
                </div>
            </div>
        </div>
    )
}
