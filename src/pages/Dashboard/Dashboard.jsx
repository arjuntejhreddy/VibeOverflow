import React, { useState, useEffect } from 'react'
import { useUser } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { getWorkoutLogs } from '../../db'
import { calculateStreak, calculateWellnessScore } from '../../utils/scoring'
import './Dashboard.css'

export default function Dashboard() {
    const { state, dispatch } = useUser()
    const navigate = useNavigate()
    const { profile } = state

    const [streak, setStreak] = useState({ current: 0, longest: 0 })
    const [wellnessScore, setWellnessScore] = useState(null)
    const [todayDone, setTodayDone] = useState(false)

    useEffect(() => {
        getWorkoutLogs().then((logs) => {
            if (logs && logs.length > 0) {
                const s = calculateStreak(logs)
                setStreak(s)
                setWellnessScore(calculateWellnessScore(logs))
                const today = new Date().toISOString().split('T')[0]
                setTodayDone(logs.some((l) => l.date?.startsWith(today)))
            }
        })
    }, [])

    const archetype = profile.archetype
    const greeting = getGreeting()

    function getGreeting() {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 17) return 'Good afternoon'
        return 'Good evening'
    }

    function handleResetOnboarding() {
        dispatch({ type: 'RESET' })
        navigate('/onboarding')
    }

    const PERSONA_NAMES = {
        drill: '🪖 Drill Sergeant',
        friend: '👯 Best Friend',
        zen: '🧘 Zen Master',
        hype: '🔥 Hype Coach',
    }

    const quickActions = [
        { emoji: '🏋️', label: 'Start Workout', desc: 'Live companion with your coach', path: '/workout', color: 'var(--color-primary)' },
        { emoji: '📋', label: 'Weekly Plan', desc: '3-layer exercise plan', path: '/plan', color: 'var(--color-accent)' },
        { emoji: '📸', label: 'Form Check', desc: 'Camera-based posture correction', path: '/posture', color: '#22d3ee' },
        { emoji: '🍛', label: 'Meal Plan', desc: "Today's meals from your kitchen", path: '/nutrition', color: 'var(--color-energy)' },
        { emoji: '📊', label: 'Progress', desc: 'XP, levels & achievements', path: '/progress', color: 'var(--color-danger)' },
        { emoji: '🤝', label: 'Training Twin', desc: 'Your AI training partner', path: '/twin/reveal', color: '#a855f7' },
    ]

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dash-header">
                <div>
                    <p className="dash-greeting">{greeting}</p>
                    <h1 className="dash-title">
                        {archetype ? `${archetype.emoji} ${archetype.name}` : 'Dashboard'}
                    </h1>
                </div>
                <button className="btn btn-icon btn-secondary" title="Redo Onboarding" onClick={handleResetOnboarding}>
                    ⟳
                </button>
            </header>

            {/* Archetype banner */}
            {archetype && (
                <div className="dash-archetype-banner glass-card" style={{ borderColor: `${archetype.color}44` }}>
                    <div className="dash-archetype-left">
                        <span className="dash-archetype-emoji">{archetype.emoji}</span>
                        <div>
                            <div className="dash-archetype-name" style={{ color: archetype.color }}>{archetype.name}</div>
                            <div className="dash-archetype-tagline">{archetype.tagline}</div>
                        </div>
                    </div>
                    <div className="dash-archetype-traits">
                        {archetype.strengths.map((s) => (
                            <span key={s} className="dash-trait-chip" style={{ color: archetype.color, borderColor: `${archetype.color}44` }}>
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Today's summary */}
            <section className="dash-section">
                <h2 className="dash-section-title">Today</h2>
                <div className="dash-today-grid">
                    <div className="dash-stat-card glass-card">
                        <span className="dash-stat-emoji">🔥</span>
                        <div className="dash-stat-value">{streak.current}</div>
                        <div className="dash-stat-label">Day streak</div>
                    </div>
                    <div className="dash-stat-card glass-card">
                        <span className="dash-stat-emoji">{todayDone ? '✅' : '💪'}</span>
                        <div className="dash-stat-value">{todayDone ? 'Done' : '—'}</div>
                        <div className="dash-stat-label">Workout</div>
                    </div>
                    <div className="dash-stat-card glass-card">
                        <span className="dash-stat-emoji">😴</span>
                        <div className="dash-stat-value">{profile.sleepHours}h</div>
                        <div className="dash-stat-label">Sleep</div>
                    </div>
                    <div className="dash-stat-card glass-card">
                        <span className="dash-stat-emoji">🧠</span>
                        <div className="dash-stat-value">{wellnessScore !== null ? wellnessScore : '—'}</div>
                        <div className="dash-stat-label">Wellness</div>
                    </div>
                </div>
            </section>

            {/* Quick actions */}
            <section className="dash-section">
                <h2 className="dash-section-title">Quick Actions</h2>
                <div className="dash-actions-grid stagger-children">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            className="dash-action-card glass-card"
                            onClick={() => navigate(action.path)}
                        >
                            <span className="dash-action-emoji">{action.emoji}</span>
                            <div>
                                <div className="dash-action-label">{action.label}</div>
                                <div className="dash-action-desc">{action.desc}</div>
                            </div>
                            <span className="dash-action-arrow" style={{ color: action.color }}>→</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Profile snapshot */}
            <section className="dash-section">
                <h2 className="dash-section-title">Your Profile</h2>
                <div className="dash-profile glass-card">
                    <div className="dash-profile-grid">
                        <div className="dash-profile-item">
                            <span className="dash-profile-label">Path</span>
                            <span className="dash-profile-value">{profile.path === 'athlete' ? '🏆 Athlete' : '✨ Lifestyle'}</span>
                        </div>
                        <div className="dash-profile-item">
                            <span className="dash-profile-label">Level</span>
                            <span className="dash-profile-value">{profile.fitnessLevel}</span>
                        </div>
                        <div className="dash-profile-item">
                            <span className="dash-profile-label">Coach</span>
                            <span className="dash-profile-value">{PERSONA_NAMES[profile.coachPersona] || profile.coachPersona}</span>
                        </div>
                        <div className="dash-profile-item">
                            <span className="dash-profile-label">Cuisine</span>
                            <span className="dash-profile-value">{profile.cuisine || '—'}</span>
                        </div>
                        <div className="dash-profile-item">
                            <span className="dash-profile-label">Fitness Test</span>
                            <span className="dash-profile-value">{profile.pushups} pushups · {profile.plankSeconds}s plank · {profile.squats} squats</span>
                        </div>
                        {profile.injuries && profile.injuries.length > 0 && (
                            <div className="dash-profile-item">
                                <span className="dash-profile-label">Injuries</span>
                                <span className="dash-profile-value" style={{ color: 'var(--color-danger-light)' }}>
                                    {profile.injuries.join(', ')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Coach message */}
            <section className="dash-section dash-coach-section">
                <div className="dash-coach glass-card">
                    <div className="dash-coach-avatar">{
                        profile.coachPersona === 'drill' ? '🪖' :
                            profile.coachPersona === 'friend' ? '👯' :
                                profile.coachPersona === 'zen' ? '🧘' : '🔥'
                    }</div>
                    <div className="dash-coach-message">
                        <div className="dash-coach-name">{PERSONA_NAMES[profile.coachPersona]}</div>
                        <p className="dash-coach-text">{getCoachMessage(profile.coachPersona)}</p>
                    </div>
                </div>
            </section>
        </div>
    )
}

function getCoachMessage(persona) {
    const messages = {
        drill: "First day? Good. The hardest part is showing up. You did that. Now let's see what you're made of. Hit 'Start Workout' — no excuses.",
        friend: "Hey! Welcome aboard! 🎉 I'm so excited to do this with you. No pressure today — just explore, get comfortable, and when you're ready, let's do our first workout together!",
        zen: "Welcome to your practice. Take a deep breath. This is not about perfection — it's about presence. When you're ready, begin your first session mindfully.",
        hype: "YOOOO LET'S GOOOO! 🔥🔥🔥 You just signed up and I am PUMPED! This is going to be LEGENDARY. Smash that Start Workout button and let's make history!",
    }
    return messages[persona] || messages.hype
}
