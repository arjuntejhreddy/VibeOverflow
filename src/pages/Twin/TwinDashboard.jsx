import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    simulateTwinDay, generateTwinReaction, generateWeeklySync,
    getTwinWeekLog, getDailyChallenge, getDailyQuote,
    getAccountabilityNudge, checkMilestones, celebrateMilestone
} from '../../ai/twins'
import { getWorkoutLogs } from '../../db'
import './Twin.css'

export default function TwinDashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()

    const [twin, setTwin] = useState(null)
    const [twinDay, setTwinDay] = useState(null)
    const [reaction, setReaction] = useState(null)
    const [weeklyMsg, setWeeklyMsg] = useState('')
    const [userStats, setUserStats] = useState({ workouts: 0, streak: 0, workoutsThisWeek: 0 })
    const [twinWeekLog, setTwinWeekLog] = useState([])
    const [dailyChallenge, setDailyChallenge] = useState(null)
    const [challengeCompleted, setChallengeCompleted] = useState(false)
    const [dailyQuote, setDailyQuote] = useState(null)
    const [nudge, setNudge] = useState(null)
    const [milestones, setMilestones] = useState([])
    const [showMilestone, setShowMilestone] = useState(null)
    const [todayDone, setTodayDone] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) { navigate('/auth'); return }

        const stored = localStorage.getItem('trainingTwin')
        if (!stored) { navigate('/twin/reveal'); return }

        const t = JSON.parse(stored)
        setTwin(t)

        // Today's sim
        const day = simulateTwinDay(t)
        setTwinDay(day)

        // 7-day log
        setTwinWeekLog(getTwinWeekLog(t))

        // Daily challenge
        setDailyChallenge(getDailyChallenge(t))
        setChallengeCompleted(localStorage.getItem('challenge_' + new Date().toDateString()) === 'done')

        // Quote
        setDailyQuote(getDailyQuote(t))

        // Load user stats
        getWorkoutLogs().then((logs) => {
            if (!logs) logs = []
            const streak = calcStreak(logs)
            const today = new Date().toISOString().split('T')[0]
            const done = logs.some(l => l.date?.startsWith(today))
            setTodayDone(done)

            const thisWeek = logs.filter(l => {
                const d = new Date(l.date)
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                return d >= weekAgo
            }).length

            const stats = { workouts: logs.length, streak, workoutsThisWeek: thisWeek }
            setUserStats(stats)

            // Accountability nudge
            if (day.didWorkout && !done) {
                setNudge(getAccountabilityNudge(t))
            }

            // Milestones
            const uncelebrated = checkMilestones(t, stats)
            setMilestones(uncelebrated)
            if (uncelebrated.length > 0) {
                setShowMilestone(uncelebrated[0])
            }

            // Sunday sync
            if (new Date().getDay() === 0) {
                setWeeklyMsg(generateWeeklySync(t, stats))
            }
        })
    }, [isAuthenticated])

    function calcStreak(logs) {
        if (!logs.length) return 0
        const dates = [...new Set(logs.map(l => new Date(l.date).toDateString()))]
            .sort((a, b) => new Date(b) - new Date(a))
        let streak = 0
        let check = new Date()
        for (const d of dates) {
            if (new Date(d).toDateString() === check.toDateString()) {
                streak++
                check.setDate(check.getDate() - 1)
            } else break
        }
        return streak
    }

    function handleCompleteChallenge() {
        localStorage.setItem('challenge_' + new Date().toDateString(), 'done')
        setChallengeCompleted(true)
    }

    function handleDismissMilestone() {
        if (showMilestone) {
            celebrateMilestone(showMilestone.id)
            const remaining = milestones.filter(m => m.id !== showMilestone.id)
            setMilestones(remaining)
            setShowMilestone(remaining.length > 0 ? remaining[0] : null)
        }
    }

    const reactions = ['I showed up', 'Personal best', 'Struggled but stayed', 'Proud of us', 'Need a nudge']

    function handleReaction(text) {
        if (!twin) return
        setReaction(generateTwinReaction(twin, text))
    }

    if (!twin) return null

    const combinedStreak = userStats.streak + twin.streak
    const twinWorkedOutThisWeek = twinWeekLog.filter(d => d.didWorkout).length

    return (
        <div className="twin-dashboard">
            <div className="bg-gradient-mesh" />

            {/* Milestone popup */}
            {showMilestone && (
                <div className="milestone-overlay" onClick={handleDismissMilestone}>
                    <div className="milestone-popup glass-card animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="milestone-icon">{showMilestone.icon}</div>
                        <h3 className="milestone-title">{showMilestone.title}</h3>
                        <p className="milestone-message">{showMilestone.message}</p>
                        <button className="btn btn-primary" onClick={handleDismissMilestone}>🎉 Celebrate!</button>
                    </div>
                </div>
            )}

            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ marginBottom: 'var(--space-4)' }}>← Dashboard</button>

            <h2 className="step-title" style={{ textAlign: 'center' }}>Training Twin</h2>
            <p className="step-subtitle" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>You + {twin.name}</p>

            {/* Accountability nudge banner */}
            {nudge && !todayDone && (
                <div className="nudge-banner glass-card animate-slide-up">
                    <span className="nudge-emoji">{nudge.emoji}</span>
                    <p className="nudge-message">{nudge.message}</p>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/workout')}>Start Workout</button>
                </div>
            )}

            {/* Daily motivational quote */}
            {dailyQuote && (
                <div className="daily-quote glass-card">
                    <blockquote className="quote-text">"{dailyQuote.quote}"</blockquote>
                    <cite className="quote-author">— {dailyQuote.author}</cite>
                    <div className="quote-from">Daily wisdom from {twin.name}'s {twin.archetype} mindset</div>
                </div>
            )}

            {/* Twin cards side by side */}
            <div className="twin-cards-row">
                <div className="twin-card glass-card">
                    <img src={user?.picture || ''} alt="" className="twin-card-avatar" />
                    <div className="twin-card-name">YOU</div>
                    <div className="twin-card-stats">
                        <div><strong>{userStats.streak}</strong> streak</div>
                        <div><strong>{userStats.workouts}</strong> total</div>
                    </div>
                    <div className={`twin-card-status ${todayDone ? 'done' : 'pending'}`}>
                        {todayDone ? '✅ Done today' : '⏳ Not yet today'}
                    </div>
                </div>
                <div className="twin-vs">🤝</div>
                <div className="twin-card glass-card">
                    <div className="twin-card-avatar-emoji">{twin.archetype === 'Spark' ? '⚡' : twin.archetype === 'Phoenix' ? '🔥' : twin.archetype === 'Monk' ? '🧘' : twin.archetype === 'Wildcard' ? '🎲' : twin.archetype === 'Architect' ? '📐' : '🏋️'}</div>
                    <div className="twin-card-name">{twin.name}</div>
                    <div className="twin-card-stats">
                        <div><strong>{twin.streak}</strong> streak</div>
                        <div><strong>{twin.city}</strong></div>
                    </div>
                    <div className={`twin-card-status ${twinDay?.didWorkout ? 'done' : 'pending'}`}>
                        {twinDay?.didWorkout ? '✅ Done today' : '😴 Rest day'}
                    </div>
                </div>
            </div>

            {/* Combined streak + match */}
            <div className="twin-combined glass-card">
                <div className="twin-combined-val">🔥 {combinedStreak}</div>
                <div className="twin-combined-label">Combined Streak · {twin.matchPercent}% Match</div>
            </div>

            {/* 7-day streak battle */}
            <div className="streak-battle glass-card">
                <h3 className="twin-section-title">📊 7-Day Streak Battle</h3>
                <div className="streak-battle-row">
                    <div className="streak-battle-label">You</div>
                    <div className="streak-battle-dots">
                        {twinWeekLog.map((_, i) => {
                            // Check if user worked out on this day
                            return <div key={`u${i}`} className={`streak-dot ${i < userStats.workoutsThisWeek ? 'active' : 'empty'}`} />
                        })}
                    </div>
                    <div className="streak-battle-count">{userStats.workoutsThisWeek}</div>
                </div>
                <div className="streak-battle-row">
                    <div className="streak-battle-label">{twin.name}</div>
                    <div className="streak-battle-dots">
                        {twinWeekLog.map((day, i) => (
                            <div key={`t${i}`} className={`streak-dot ${day.didWorkout ? 'active twin-dot' : 'empty'}`} />
                        ))}
                    </div>
                    <div className="streak-battle-count">{twinWorkedOutThisWeek}</div>
                </div>
                <div className="streak-battle-verdict">
                    {userStats.workoutsThisWeek > twinWorkedOutThisWeek
                        ? '🏆 You\'re winning this week!'
                        : userStats.workoutsThisWeek === twinWorkedOutThisWeek
                            ? '🤝 Neck and neck!'
                            : `😤 ${twin.name} is ahead — time to catch up!`
                    }
                </div>
            </div>

            {/* Daily challenge */}
            {dailyChallenge && (
                <div className={`daily-challenge glass-card ${challengeCompleted ? 'completed' : ''}`}>
                    <div className="challenge-header">
                        <span className="challenge-icon">{dailyChallenge.icon}</span>
                        <div>
                            <h3 className="twin-section-title" style={{ marginBottom: 0 }}>Today's Challenge</h3>
                            <div className="challenge-from">from {twin.name}</div>
                        </div>
                        <div className="challenge-xp">+{dailyChallenge.xp} XP</div>
                    </div>
                    <h4 className="challenge-title">{dailyChallenge.title}</h4>
                    <p className="challenge-desc">{dailyChallenge.desc}</p>
                    {!challengeCompleted ? (
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCompleteChallenge}>
                            ✅ Mark Complete
                        </button>
                    ) : (
                        <div className="challenge-done">
                            <span>🎉</span> Challenge completed! {twin.name} is proud.
                        </div>
                    )}
                </div>
            )}

            {/* Twin's day */}
            {twinDay && (
                <div className="twin-today glass-card">
                    <h3 className="twin-section-title">{twin.name}'s Day</h3>
                    <div className="twin-today-status">
                        <span className={`twin-status-dot ${twinDay.didWorkout ? 'active' : 'rest'}`} />
                        <span>{twinDay.didWorkout ? 'Worked out' : 'Rest day'}</span>
                    </div>
                    <p className="twin-today-summary">{twinDay.summary}</p>
                </div>
            )}

            {/* Twin's week log */}
            <div className="twin-week-log glass-card">
                <h3 className="twin-section-title">📅 {twin.name}'s Week</h3>
                <div className="week-log-grid">
                    {twinWeekLog.map((day, i) => (
                        <div key={i} className={`week-log-day ${day.didWorkout ? 'active' : 'rest'}`}>
                            <div className="week-log-label">{day.dayLabel}</div>
                            <div className="week-log-icon">{day.didWorkout ? '💪' : '😴'}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reactions */}
            <div className="twin-reactions glass-card">
                <h3 className="twin-section-title">💬 Send a Reaction</h3>
                <div className="twin-reaction-btns">
                    {reactions.map((r) => (
                        <button key={r} className="btn btn-secondary" onClick={() => handleReaction(r)}>
                            {r}
                        </button>
                    ))}
                </div>
                {reaction && (
                    <div className="twin-reaction-response animate-slide-up">
                        <span className="twin-reaction-emoji">{reaction.emoji}</span>
                        <p className="twin-reaction-msg">{reaction.message}</p>
                    </div>
                )}
            </div>

            {/* Weekly sync */}
            {weeklyMsg && (
                <div className="twin-weekly glass-card">
                    <h3 className="twin-section-title">📅 Weekly Sync</h3>
                    <p className="twin-weekly-msg">{weeklyMsg}</p>
                </div>
            )}

            {/* Reset twin */}
            <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }} onClick={() => {
                    localStorage.removeItem('trainingTwin')
                    localStorage.removeItem('twinMilestones')
                    navigate('/twin/reveal')
                }}>
                    Find a new twin
                </button>
            </div>
        </div>
    )
}
