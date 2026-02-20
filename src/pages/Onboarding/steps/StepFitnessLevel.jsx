import React from 'react'

const LEVELS = [
    {
        id: 'beginner',
        icon: '🌱',
        title: 'Beginner',
        desc: 'New to exercise or returning after a long break. Less than 6 months of training.',
    },
    {
        id: 'intermediate',
        icon: '💪',
        title: 'Intermediate',
        desc: 'Consistent training for 6-24 months. Comfortable with most exercises.',
    },
    {
        id: 'advanced',
        icon: '🔥',
        title: 'Advanced',
        desc: '2+ years of consistent training. Strong foundation and training knowledge.',
    },
]

export default function StepFitnessLevel({ profile, updateProfile }) {
    return (
        <div>
            <h2 className="step-title">What's your fitness level?</h2>
            <p className="step-subtitle">
                Be honest — this helps us calibrate your plan perfectly. No judgment.
            </p>
            <div className="level-cards">
                {LEVELS.map((level) => (
                    <div
                        key={level.id}
                        className={`level-card ${profile.fitnessLevel === level.id ? 'selected' : ''}`}
                        onClick={() => updateProfile({ fitnessLevel: level.id })}
                    >
                        <span className="level-icon">{level.icon}</span>
                        <div className="level-info">
                            <div className="level-title">{level.title}</div>
                            <div className="level-desc">{level.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
