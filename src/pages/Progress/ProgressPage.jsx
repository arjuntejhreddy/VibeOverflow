import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { getWorkoutLogs, getSetting, saveSetting } from '../../db'
import './Progress.css'

const XP_TABLE = {
    workout: 50,
    streak3: 30,
    streak7: 100,
    streak14: 250,
    streak30: 500,
    meals_logged: 15,
    form_check: 25,
    twin_reaction: 10,
    debrief: 20,
    mood_checkin: 10,
    perfect_form: 40,
}

const LEVELS = [
    { level: 1, name: 'Rookie', xpReq: 0 },
    { level: 2, name: 'Beginner', xpReq: 100 },
    { level: 3, name: 'Regular', xpReq: 300 },
    { level: 4, name: 'Committed', xpReq: 600 },
    { level: 5, name: 'Iron Will', xpReq: 1000 },
    { level: 6, name: 'Machine', xpReq: 1500 },
    { level: 7, name: 'Beast', xpReq: 2200 },
    { level: 8, name: 'Legend', xpReq: 3000 },
    { level: 9, name: 'Titan', xpReq: 4000 },
    { level: 10, name: 'Olympian', xpReq: 5500 },
]

const ACHIEVEMENTS = [
    { id: 'first_workout', name: 'First Step', description: 'Complete your first workout', icon: '🏃', condition: (data) => data.workouts >= 1 },
    { id: 'streak_3', name: 'Consistent', description: '3-day workout streak', icon: '🔥', condition: (data) => data.streak >= 3 },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day workout streak', icon: '⚡', condition: (data) => data.streak >= 7 },
    { id: 'streak_14', name: 'Unstoppable', description: '14-day workout streak', icon: '💎', condition: (data) => data.streak >= 14 },
    { id: 'streak_30', name: 'Iron Will', description: '30-day workout streak', icon: '👑', condition: (data) => data.streak >= 30 },
    { id: 'workouts_5', name: '5 Workouts', description: 'Complete 5 workouts', icon: '🎯', condition: (data) => data.workouts >= 5 },
    { id: 'workouts_10', name: 'Ten Timer', description: 'Complete 10 workouts', icon: '🏆', condition: (data) => data.workouts >= 10 },
    { id: 'workouts_25', name: 'Quarter Century', description: '25 workouts logged', icon: '🥇', condition: (data) => data.workouts >= 25 },
    { id: 'workouts_50', name: 'Half Century', description: '50 workouts logged', icon: '🏅', condition: (data) => data.workouts >= 50 },
    { id: 'level_5', name: 'Iron Will', description: 'Reach Level 5', icon: '💪', condition: (data) => data.level >= 5 },
    { id: 'level_10', name: 'Olympian', description: 'Reach Level 10', icon: '⭐', condition: (data) => data.level >= 10 },
    { id: 'twin_active', name: 'Training Partner', description: 'Match with a training twin', icon: '🤝', condition: (data) => data.hasTwin },
    { id: 'perfect_mood', name: 'Peak Vibes', description: 'Start a workout FIRED UP', icon: '🔥', condition: (data) => data.peakMood },
]

export default function ProgressPage() {
    const navigate = useNavigate()
    const { state } = useUser()

    const [logs, setLogs] = useState([])
    const [totalXP, setTotalXP] = useState(0)
    const [newBadge, setNewBadge] = useState(null)
    const [showBadgeAnimation, setShowBadgeAnimation] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const workoutLogs = (await getWorkoutLogs()) || []
        setLogs(workoutLogs)

        // Calculate XP
        let xp = (await getSetting('totalXP')) || 0
        if (xp === 0 && workoutLogs.length > 0) {
            // Bootstrap XP from existing data
            xp = workoutLogs.length * XP_TABLE.workout
            const streak = calculateStreak(workoutLogs)
            if (streak >= 3) xp += XP_TABLE.streak3
            if (streak >= 7) xp += XP_TABLE.streak7
            if (streak >= 14) xp += XP_TABLE.streak14
            if (streak >= 30) xp += XP_TABLE.streak30
            workoutLogs.forEach(l => {
                if (l.debrief) xp += XP_TABLE.debrief
                if (l.mood) xp += XP_TABLE.mood_checkin
            })
            await saveSetting('totalXP', xp)
        }
        setTotalXP(xp)

        // Check for new badges
        const unlockedBadges = (await getSetting('unlockedBadges')) || []
        const data = buildAchievementData(workoutLogs, xp)
        const newUnlocked = ACHIEVEMENTS.filter(a =>
            a.condition(data) && !unlockedBadges.includes(a.id)
        )
        if (newUnlocked.length > 0) {
            const updated = [...unlockedBadges, ...newUnlocked.map(a => a.id)]
            await saveSetting('unlockedBadges', updated)
            setNewBadge(newUnlocked[0])
            setShowBadgeAnimation(true)
            setTimeout(() => setShowBadgeAnimation(false), 3000)
        }
    }

    function buildAchievementData(workoutLogs, xp) {
        const streak = calculateStreak(workoutLogs)
        const level = getCurrentLevel(xp).level
        const hasTwin = !!localStorage.getItem('trainingTwin')
        const peakMood = workoutLogs.some(l => l.mood === 5)
        return { workouts: workoutLogs.length, streak, level, hasTwin, peakMood }
    }

    function calculateStreak(workoutLogs) {
        if (!workoutLogs.length) return 0
        const dates = [...new Set(workoutLogs.map(l => new Date(l.date).toDateString()))]
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

    function getCurrentLevel(xp) {
        let current = LEVELS[0]
        for (const level of LEVELS) {
            if (xp >= level.xpReq) current = level
        }
        return current
    }

    function getNextLevel(xp) {
        for (const level of LEVELS) {
            if (xp < level.xpReq) return level
        }
        return LEVELS[LEVELS.length - 1]
    }

    const streak = useMemo(() => calculateStreak(logs), [logs])
    const currentLevel = getCurrentLevel(totalXP)
    const nextLevel = getNextLevel(totalXP)
    const xpProgress = nextLevel.xpReq > currentLevel.xpReq
        ? ((totalXP - currentLevel.xpReq) / (nextLevel.xpReq - currentLevel.xpReq)) * 100
        : 100

    // Heatmap data
    const heatmapData = useMemo(() => {
        const map = {}
        logs.forEach(l => {
            const d = new Date(l.date).toDateString()
            map[d] = (map[d] || 0) + 1
        })
        return map
    }, [logs])

    // Generate last 28 days for heatmap
    const heatmapDays = useMemo(() => {
        const days = []
        for (let i = 27; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            days.push({
                date: d,
                label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
                count: heatmapData[d.toDateString()] || 0,
            })
        }
        return days
    }, [heatmapData])

    const achievementData = useMemo(() => buildAchievementData(logs, totalXP), [logs, totalXP])
    const unlockedIds = ACHIEVEMENTS.filter(a => a.condition(achievementData)).map(a => a.id)

    return (
        <div className="progress-page">
            <div className="bg-gradient-mesh" />

            {/* Badge popup */}
            {showBadgeAnimation && newBadge && (
                <div className="badge-popup-overlay">
                    <div className="badge-popup glass-card animate-scale-in">
                        <div className="badge-popup-icon">{newBadge.icon}</div>
                        <h3 className="badge-popup-title">Achievement Unlocked!</h3>
                        <p className="badge-popup-name">{newBadge.name}</p>
                        <p className="badge-popup-desc">{newBadge.description}</p>
                    </div>
                </div>
            )}

            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ marginBottom: 'var(--space-4)' }}>← Dashboard</button>

            {/* Level + XP */}
            <div className="progress-level glass-card">
                <div className="level-badge">
                    <div className="level-number">Lv.{currentLevel.level}</div>
                    <div className="level-name">{currentLevel.name}</div>
                </div>
                <div className="xp-section">
                    <div className="xp-header">
                        <span className="xp-total">{totalXP} XP</span>
                        <span className="xp-next">Next: {nextLevel.name} ({nextLevel.xpReq} XP)</span>
                    </div>
                    <div className="xp-bar">
                        <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
                    </div>
                    <div className="xp-breakdown">
                        <span>+{XP_TABLE.workout} per workout</span>
                        <span>+{XP_TABLE.streak7} per 7-day streak</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="progress-stats">
                <div className="progress-stat-card glass-card">
                    <div className="stat-value">{streak}</div>
                    <div className="stat-label">Day Streak</div>
                </div>
                <div className="progress-stat-card glass-card">
                    <div className="stat-value">{logs.length}</div>
                    <div className="stat-label">Workouts</div>
                </div>
                <div className="progress-stat-card glass-card">
                    <div className="stat-value">{unlockedIds.length}/{ACHIEVEMENTS.length}</div>
                    <div className="stat-label">Badges</div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="progress-heatmap glass-card">
                <h3 className="progress-section-title">Activity (28 days)</h3>
                <div className="heatmap-grid">
                    {heatmapDays.map((day, i) => (
                        <div
                            key={i}
                            className={`heatmap-cell ${day.count === 0 ? 'empty' : day.count === 1 ? 'low' : day.count === 2 ? 'med' : 'high'}`}
                            title={`${day.date.toLocaleDateString()}: ${day.count} workout${day.count !== 1 ? 's' : ''}`}
                        >
                            <span className="heatmap-day-label">{day.label}</span>
                        </div>
                    ))}
                </div>
                <div className="heatmap-legend">
                    <span>Less</span>
                    <div className="heatmap-cell empty legend" />
                    <div className="heatmap-cell low legend" />
                    <div className="heatmap-cell med legend" />
                    <div className="heatmap-cell high legend" />
                    <span>More</span>
                </div>
            </div>

            {/* Achievements */}
            <div className="progress-achievements">
                <h3 className="progress-section-title">Achievements</h3>
                <div className="achievements-grid">
                    {ACHIEVEMENTS.map((a) => {
                        const unlocked = unlockedIds.includes(a.id)
                        return (
                            <div key={a.id} className={`achievement-card glass-card ${unlocked ? 'unlocked' : 'locked'}`}>
                                <div className="achievement-icon">{unlocked ? a.icon : '🔒'}</div>
                                <div className="achievement-info">
                                    <div className="achievement-name">{a.name}</div>
                                    <div className="achievement-desc">{a.description}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Recent workouts */}
            {logs.length > 0 && (
                <div className="progress-recent">
                    <h3 className="progress-section-title">Recent Workouts</h3>
                    <div className="recent-list">
                        {logs.slice(-5).reverse().map((log, i) => (
                            <div key={i} className="recent-item glass-card">
                                <div className="recent-date">{new Date(log.date).toLocaleDateString()}</div>
                                <div className="recent-meta">
                                    <span>{log.duration} min</span>
                                    <span>{log.exercisesCompleted} exercises</span>
                                    {log.mood && <span>Mood: {['😫', '😕', '😐', '😊', '🔥'][log.mood - 1]}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
