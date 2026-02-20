import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { generateTwin } from '../../ai/twins'
import { HERO_IMAGES } from '../../utils/images'
import './Twin.css'

export default function TwinReveal() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()

    const [phase, setPhase] = useState('intro') // intro | generating | reveal
    const [twin, setTwin] = useState(null)

    useEffect(() => {
        if (!isAuthenticated) navigate('/auth')
    }, [isAuthenticated])

    // Check if twin already exists
    useEffect(() => {
        const stored = localStorage.getItem('trainingTwin')
        if (stored) {
            setTwin(JSON.parse(stored))
            setPhase('reveal')
        }
    }, [])

    function handleGenerate() {
        setPhase('generating')
        // Simulate a short delay for the reveal animation
        setTimeout(() => {
            const newTwin = generateTwin(user)
            localStorage.setItem('trainingTwin', JSON.stringify(newTwin))
            setTwin(newTwin)
            setPhase('reveal')
        }, 2000)
    }

    function handleGoToDashboard() {
        navigate('/twin')
    }

    return (
        <div className="twin-page">
            <div className="bg-gradient-mesh" />
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ marginBottom: 'var(--space-4)' }}>← Dashboard</button>

            {phase === 'intro' && (
                <div className="twin-intro animate-slide-up">
                    <div className="twin-hero-img-container">
                        <img src={HERO_IMAGES.twin} alt="" className="twin-hero-img" />
                        <div className="twin-hero-img-overlay" />
                    </div>

                    <h1 className="step-title" style={{ textAlign: 'center' }}>Meet Your Training Twin</h1>
                    <p className="step-subtitle" style={{ textAlign: 'center', maxWidth: 450, margin: '0 auto var(--space-6)' }}>
                        We'll match you with an AI training partner based on your Google profile.
                        They'll train alongside you, react to your sessions, and keep you accountable.
                    </p>

                    <div className="twin-user-preview glass-card">
                        <img src={user?.picture} alt="" className="twin-user-avatar" />
                        <div>
                            <div style={{ fontWeight: 700 }}>{user?.name}</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{user?.email}</div>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-4)' }} onClick={handleGenerate}>
                        🤝 Find My Twin
                    </button>
                </div>
            )}

            {phase === 'generating' && (
                <div className="twin-generating animate-slide-up" style={{ textAlign: 'center', paddingTop: 'var(--space-16)' }}>
                    <div className="loading-pulse" style={{ marginBottom: 'var(--space-6)' }}>
                        <span className="loading-logo">🔍</span>
                    </div>
                    <h2 className="step-title">Searching for your twin...</h2>
                    <p className="step-subtitle">Matching you with the perfect training partner</p>
                </div>
            )}

            {phase === 'reveal' && twin && (
                <div className="twin-reveal animate-scale-in">
                    <div className="confetti-burst" />
                    <div className="twin-reveal-card glass-card">
                        <div className="twin-match-badge">{twin.matchPercent}% MATCH</div>
                        <h2 className="twin-reveal-name">{twin.name}</h2>
                        <p className="twin-reveal-meta">{twin.age} · {twin.city}</p>
                        <div className="twin-reveal-archetype">{twin.archetype}</div>
                        <p className="twin-reveal-backstory">{twin.backstory}</p>
                        <p className="twin-reveal-goal">{twin.goal}</p>

                        <div className="twin-reveal-stats">
                            <div className="twin-reveal-stat">
                                <span className="twin-stat-val">{twin.streak}</span>
                                <span className="twin-stat-label">day streak</span>
                            </div>
                            <div className="twin-reveal-stat">
                                <span className="twin-stat-val">{twin.weakDay}</span>
                                <span className="twin-stat-label">weak day</span>
                            </div>
                        </div>

                        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-6)' }} onClick={handleGoToDashboard}>
                            Go to Twin Dashboard →
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
