import React from 'react'

export default function StepPathSelect({ profile, updateProfile }) {
    return (
        <div>
            <h2 className="step-title">What brings you here?</h2>
            <p className="step-subtitle">
                Choose your path — this shapes everything from your training plan to your nutrition.
            </p>
            <div className="path-cards">
                <div
                    className={`path-card ${profile.path === 'athlete' ? 'selected' : ''}`}
                    onClick={() => updateProfile({ path: 'athlete' })}
                >
                    <span className="path-card-emoji">🏆</span>
                    <div className="path-card-title">Competitive Athlete</div>
                    <p className="path-card-desc">
                        Training for a specific sport or competition. Periodized plan with a peak date.
                    </p>
                </div>
                <div
                    className={`path-card ${profile.path === 'lifestyle' ? 'selected' : ''}`}
                    onClick={() => updateProfile({ path: 'lifestyle' })}
                >
                    <span className="path-card-emoji">✨</span>
                    <div className="path-card-title">Lifestyle Goal</div>
                    <p className="path-card-desc">
                        Get fitter, lose weight, build muscle, or just feel amazing every day.
                    </p>
                </div>
            </div>
        </div>
    )
}
