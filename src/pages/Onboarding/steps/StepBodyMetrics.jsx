import React from 'react'

export default function StepBodyMetrics({ profile, updateProfile }) {
    return (
        <div>
            <h2 className="step-title">Body metrics</h2>
            <p className="step-subtitle">
                These help us calculate calories, set realistic targets, and personalize your plan.
            </p>

            <div className="step-form-row">
                <div className="step-form-group">
                    <label className="input-label">Age</label>
                    <input
                        className="input-field"
                        type="number"
                        placeholder="25"
                        min="13"
                        max="99"
                        value={profile.age}
                        onChange={(e) => updateProfile({ age: e.target.value })}
                    />
                </div>
                <div className="step-form-group">
                    <label className="input-label">Gender</label>
                    <select
                        className="select-field"
                        value={profile.gender}
                        onChange={(e) => updateProfile({ gender: e.target.value })}
                    >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not">Prefer not to say</option>
                    </select>
                </div>
            </div>

            <div className="step-form-row">
                <div className="step-form-group">
                    <label className="input-label">Height (cm)</label>
                    <input
                        className="input-field"
                        type="number"
                        placeholder="170"
                        min="100"
                        max="250"
                        value={profile.height}
                        onChange={(e) => updateProfile({ height: e.target.value })}
                    />
                </div>
                <div className="step-form-group">
                    <label className="input-label">Weight (kg)</label>
                    <input
                        className="input-field"
                        type="number"
                        placeholder="70"
                        min="30"
                        max="250"
                        value={profile.weight}
                        onChange={(e) => updateProfile({ weight: e.target.value })}
                    />
                </div>
            </div>
        </div>
    )
}
