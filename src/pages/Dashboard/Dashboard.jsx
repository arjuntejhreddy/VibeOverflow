import React, { useState, useEffect } from 'react'
import { useUser } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { getWorkoutLogs } from '../../db'
import { calculateStreak, calculateWellnessScore } from '../../utils/scoring'
import './Dashboard.css'

/* Minimal inline SVG icons — no emojis */
function Icon({ d, size = 20, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    )
}

const ICONS = {
    streak: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
    workout: 'M13 10V3L4 14h7v7l9-11h-7z',
    sleep: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
    wellness: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    plan: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    camera: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    nutrition: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    progress: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    twin: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    arrow: 'M14 5l7 7m0 0l-7 7m7-7H3',
    check: 'M5 13l4 4L19 7',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
}

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

    function handleResetOnboarding() {
        dispatch({ type: 'RESET' })
        navigate('/onboarding')
    }

    const PERSONA_NAMES = {
        drill: 'Drill Sergeant',
        friend: 'Best Friend',
        zen: 'Zen Master',
        hype: 'Hype Coach',
    }

    const quickActions = [
        { icon: ICONS.workout, label: 'Start Workout', desc: 'Live companion with your coach', path: '/workout', theme: 'primary' },
        { icon: ICONS.plan, label: 'Weekly Plan', desc: '3-layer exercise plan', path: '/plan', theme: 'teal' },
        { icon: ICONS.camera, label: 'Form Check', desc: 'Camera-based posture correction', path: '/posture', theme: 'blue' },
        { icon: ICONS.nutrition, label: 'Meal Plan', desc: "Today's meals from your kitchen", path: '/nutrition', theme: 'coral' },
        { icon: ICONS.progress, label: 'Progress', desc: 'XP, levels & achievements', path: '/progress', theme: 'green' },
        { icon: ICONS.twin, label: 'Training Twin', desc: 'Your AI training partner', path: '/twin/reveal', theme: 'purple' },
    ]

    const metrics = [
        {
            icon: ICONS.streak, value: streak.current, label: 'Day Streak',
            theme: 'coral', sub: `Best: ${streak.longest}`,
        },
        {
            icon: todayDone ? ICONS.check : ICONS.workout, value: todayDone ? 'Done' : 'Not yet', label: 'Today\'s Workout',
            theme: todayDone ? 'green' : 'primary', sub: todayDone ? 'Great work!' : 'Let\'s go!',
        },
        {
            icon: ICONS.sleep, value: `${profile.sleepHours}h`, label: 'Sleep',
            theme: 'blue', sub: profile.sleepHours >= 7 ? 'Well rested' : 'Need more rest',
        },
        {
            icon: ICONS.wellness, value: wellnessScore !== null ? wellnessScore : '—', label: 'Wellness',
            theme: 'teal', sub: 'Overall score',
        },
    ]

    return (
        <div className="dashboard animate-fade-in">
            {/* Metric Cards */}
            <section className="section-container">
                <div className="metrics-grid stagger-children">
                    {metrics.map((m, i) => (
                        <div key={i} className={`metric-card metric-${m.theme}`}>
                            <div className="metric-icon-wrap">
                                <Icon d={m.icon} size={22} color="currentColor" />
                            </div>
                            <div className="metric-value">{m.value}</div>
                            <div className="metric-label">{m.label}</div>
                            <div className="metric-sub">{m.sub}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Archetype banner */}
            {archetype && (
                <section className="section-container">
                    <div className="archetype-banner glass-card">
                        <div className="archetype-left">
                            <div className="archetype-badge" style={{ background: archetype.color }}>
                                {archetype.name.charAt(0)}
                            </div>
                            <div>
                                <div className="archetype-name">{archetype.name}</div>
                                <div className="archetype-tagline">{archetype.tagline}</div>
                            </div>
                        </div>
                        <div className="archetype-traits">
                            {archetype.strengths.map((s) => (
                                <span key={s} className="trait-chip">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Quick Actions */}
            <section className="section-container">
                <h2 className="section-title">Quick Actions</h2>
                <div className="actions-grid stagger-children">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            className="action-card glass-card"
                            onClick={() => navigate(action.path)}
                        >
                            <div className={`action-icon-wrap action-icon-${action.theme}`}>
                                <Icon d={action.icon} size={20} />
                            </div>
                            <div className="action-info">
                                <div className="action-label">{action.label}</div>
                                <div className="action-desc">{action.desc}</div>
                            </div>
                            <span className="action-arrow">
                                <Icon d={ICONS.arrow} size={16} />
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Coach Section */}
            <section className="section-container">
                <h2 className="section-title">Your Coach</h2>
                <div className="coach-card glass-card">
                    <div className="coach-avatar-wrap">
                        {(profile.coachPersona || 'H').charAt(0).toUpperCase()}
                    </div>
                    <div className="coach-content">
                        <div className="coach-name">{PERSONA_NAMES[profile.coachPersona] || 'Coach'}</div>
                        <p className="coach-text">{getCoachMessage(profile.coachPersona)}</p>
                    </div>
                </div>
            </section>

            {/* Profile Snapshot */}
            <section className="section-container">
                <div className="profile-header-row">
                    <h2 className="section-title">Your Profile</h2>
                    <button className="btn btn-ghost btn-sm" onClick={handleResetOnboarding}>
                        <Icon d={ICONS.refresh} size={14} /> Redo Setup
                    </button>
                </div>
                <div className="profile-card glass-card">
                    <div className="profile-grid">
                        <ProfileItem label="Path" value={profile.path === 'athlete' ? 'Athlete' : 'Lifestyle'} />
                        <ProfileItem label="Level" value={profile.fitnessLevel} />
                        <ProfileItem label="Coach" value={PERSONA_NAMES[profile.coachPersona] || profile.coachPersona} />
                        <ProfileItem label="Cuisine" value={profile.cuisine || '—'} />
                        <ProfileItem label="Fitness Test" value={`${profile.pushups} pushups · ${profile.plankSeconds}s plank · ${profile.squats} squats`} span />
                        {profile.injuries && profile.injuries.length > 0 && (
                            <ProfileItem label="Injuries" value={profile.injuries.join(', ')} danger span />
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

function ProfileItem({ label, value, danger, span }) {
    return (
        <div className={`profile-item ${span ? 'span-full' : ''}`}>
            <span className="profile-label">{label}</span>
            <span className={`profile-value ${danger ? 'danger' : ''}`}>{value}</span>
        </div>
    )
}

function getCoachMessage(persona) {
    const messages = {
        drill: "First day? Good. The hardest part is showing up. You did that. Now let's see what you're made of. Hit 'Start Workout' — no excuses.",
        friend: "Hey! Welcome aboard! I'm so excited to do this with you. No pressure today — just explore, get comfortable, and when you're ready, let's do our first workout together!",
        zen: "Welcome to your practice. Take a deep breath. This is not about perfection — it's about presence. When you're ready, begin your first session mindfully.",
        hype: "LET'S GO! You just signed up and I am PUMPED! This is going to be LEGENDARY. Smash that Start Workout button and let's make history!",
    }
    return messages[persona] || messages.hype
}
