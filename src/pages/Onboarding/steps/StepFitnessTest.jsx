import React from 'react'

export default function StepFitnessTest({ profile, updateProfile }) {
    return (
        <div>
            <h2 className="step-title">Quick fitness test</h2>
            <p className="step-subtitle">
                Do these right now (or your best estimate). This gives us a real baseline — not just a self-reported level.
            </p>

            <div className="fitness-test-item">
                <span className="fitness-test-icon">💪</span>
                <div className="fitness-test-info">
                    <div className="fitness-test-name">Max Push-ups</div>
                    <div className="fitness-test-helper">In one set, no rest. Stop when form breaks.</div>
                </div>
                <input
                    className="input-field fitness-test-input"
                    type="number"
                    min="0"
                    max="200"
                    placeholder="0"
                    value={profile.pushups || ''}
                    onChange={(e) => updateProfile({ pushups: Number(e.target.value) })}
                />
            </div>

            <div className="fitness-test-item">
                <span className="fitness-test-icon">🧘</span>
                <div className="fitness-test-info">
                    <div className="fitness-test-name">Plank Hold</div>
                    <div className="fitness-test-helper">In seconds. Full plank, elbows on ground.</div>
                </div>
                <input
                    className="input-field fitness-test-input"
                    type="number"
                    min="0"
                    max="600"
                    placeholder="0"
                    value={profile.plankSeconds || ''}
                    onChange={(e) => updateProfile({ plankSeconds: Number(e.target.value) })}
                />
            </div>

            <div className="fitness-test-item">
                <span className="fitness-test-icon">🦵</span>
                <div className="fitness-test-info">
                    <div className="fitness-test-name">Bodyweight Squats</div>
                    <div className="fitness-test-helper">In 60 seconds. Full range of motion.</div>
                </div>
                <input
                    className="input-field fitness-test-input"
                    type="number"
                    min="0"
                    max="200"
                    placeholder="0"
                    value={profile.squats || ''}
                    onChange={(e) => updateProfile({ squats: Number(e.target.value) })}
                />
            </div>
        </div>
    )
}
