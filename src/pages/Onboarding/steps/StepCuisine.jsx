import React from 'react'

const CUISINES = [
    { id: 'indian', emoji: '🍛', name: 'Indian' },
    { id: 'middle-eastern', emoji: '🧆', name: 'Middle Eastern' },
    { id: 'east-asian', emoji: '🍜', name: 'East Asian' },
    { id: 'mediterranean', emoji: '🫒', name: 'Mediterranean' },
    { id: 'latin', emoji: '🌮', name: 'Latin American' },
    { id: 'western', emoji: '🥩', name: 'Western' },
    { id: 'african', emoji: '🍲', name: 'African' },
    { id: 'southeast-asian', emoji: '🍲', name: 'Southeast Asian' },
    { id: 'mixed', emoji: '🌍', name: 'Mixed / No Preference' },
]

export default function StepCuisine({ profile, updateProfile }) {
    return (
        <div>
            <h2 className="step-title">What do you eat?</h2>
            <p className="step-subtitle">
                We'll build your meal plans around the food you actually cook and enjoy. No more avocado toast if you eat dal every day.
            </p>

            <div className="cuisine-grid">
                {CUISINES.map((c) => (
                    <div
                        key={c.id}
                        className={`cuisine-card ${profile.cuisine === c.id ? 'selected' : ''}`}
                        onClick={() => updateProfile({ cuisine: c.id })}
                    >
                        <span className="cuisine-emoji">{c.emoji}</span>
                        <span className="cuisine-name">{c.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
