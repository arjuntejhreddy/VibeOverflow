import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { getWorkoutLogs, getSetting, saveSetting } from '../../db'
import './Progress.css'

/* ─── XP / Level config (unchanged) ─── */
const XP_TABLE = {
    workout: 50, streak3: 30, streak7: 100, streak14: 250, streak30: 500,
    meals_logged: 15, form_check: 25, twin_reaction: 10, debrief: 20,
    mood_checkin: 10, perfect_form: 40,
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
    { id: 'first_workout', name: 'First Step', description: 'Complete your first workout', xp: 50, condition: (d) => d.workouts >= 1 },
    { id: 'streak_3', name: 'Consistent', description: '3-day workout streak', xp: 30, condition: (d) => d.streak >= 3 },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day workout streak', xp: 100, condition: (d) => d.streak >= 7 },
    { id: 'streak_14', name: 'Unstoppable', description: '14-day workout streak', xp: 250, condition: (d) => d.streak >= 14 },
    { id: 'streak_30', name: 'Iron Will', description: '30-day workout streak', xp: 500, condition: (d) => d.streak >= 30 },
    { id: 'workouts_5', name: '5 Workouts', description: 'Complete 5 workouts', xp: 75, condition: (d) => d.workouts >= 5 },
    { id: 'workouts_10', name: 'Ten Timer', description: 'Complete 10 workouts', xp: 150, condition: (d) => d.workouts >= 10 },
    { id: 'workouts_25', name: 'Quarter Century', description: '25 workouts logged', xp: 300, condition: (d) => d.workouts >= 25 },
    { id: 'workouts_50', name: 'Half Century', description: '50 workouts logged', xp: 600, condition: (d) => d.workouts >= 50 },
    { id: 'level_5', name: 'Iron Will', description: 'Reach Level 5', xp: 200, condition: (d) => d.level >= 5 },
    { id: 'level_10', name: 'Olympian', description: 'Reach Level 10', xp: 1000, condition: (d) => d.level >= 10 },
    { id: 'twin_active', name: 'Training Partner', description: 'Match with a training twin', xp: 50, condition: (d) => d.hasTwin },
    { id: 'perfect_mood', name: 'Peak Vibes', description: 'Start a workout FIRED UP', xp: 40, condition: (d) => d.peakMood },
]

/* ─── Generate synthetic demo data when no real logs exist ─── */
function generateDemoLogs(profile) {
    const pushups = parseInt(profile?.pushups) || 20
    const squats = parseInt(profile?.squats) || 30
    const plank = parseInt(profile?.plankSeconds) || 60
    const count = 14
    const logs = []
    for (let i = count; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const noise = () => Math.floor(Math.random() * 5 - 2)
        const progress = (count - i) / count
        logs.push({
            date: d.toISOString(),
            duration: 30 + Math.floor(progress * 20) + noise(),
            exercisesCompleted: 4 + Math.floor(progress * 4),
            mood: Math.min(5, Math.floor(progress * 5) + 2 + noise()),
            pushups: Math.round(pushups * (1 + progress * 0.35) + noise()),
            squats: Math.round(squats * (1 + progress * 0.3) + noise()),
            plankSeconds: Math.round(plank * (1 + progress * 0.4) + noise() * 5),
        })
    }
    return logs
}

/* ─── SVG Line Chart Component ─── */
function LineChart({ data, color = '#2563EB', label = '', unit = '' }) {
    const [tooltip, setTooltip] = useState(null)
    const svgRef = useRef(null)
    const W = 560, H = 180, PAD = { top: 16, right: 16, bottom: 36, left: 40 }
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom

    if (!data || data.length < 2) {
        return (
            <div className="chart-empty">
                <span>Not enough data yet — log more workouts</span>
            </div>
        )
    }

    const minVal = Math.min(...data.map(d => d.value)) * 0.9
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1
    const xScale = (i) => PAD.left + (i / (data.length - 1)) * innerW
    const yScale = (v) => PAD.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH

    const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.value), ...d }))
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaD = `${pathD} L ${points[points.length - 1].x} ${H - PAD.bottom} L ${points[0].x} ${H - PAD.bottom} Z`

    // Y-axis ticks
    const ticks = 4
    const yTicks = Array.from({ length: ticks }, (_, i) => minVal + (i / (ticks - 1)) * (maxVal - minVal))

    function handleMouseMove(e) {
        const rect = svgRef.current.getBoundingClientRect()
        const mx = (e.clientX - rect.left) * (W / rect.width) - PAD.left
        const idx = Math.max(0, Math.min(data.length - 1, Math.round((mx / innerW) * (data.length - 1))))
        setTooltip({ ...points[idx], idx })
    }

    return (
        <div className="line-chart-wrap" style={{ '--chart-color': color }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                className="line-chart-svg"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTooltip(null)}
                aria-label={`${label} line chart`}
            >
                <defs>
                    <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Grid lines */}
                {yTicks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={PAD.left} y1={yScale(tick)}
                            x2={W - PAD.right} y2={yScale(tick)}
                            stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="4 4"
                        />
                        <text x={PAD.left - 6} y={yScale(tick) + 4} fontSize="10" fill="#999" textAnchor="end">
                            {Math.round(tick)}{unit}
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i, arr) => {
                    const origIdx = data.indexOf(d)
                    return (
                        <text key={i} x={xScale(origIdx)} y={H - 8} fontSize="10" fill="#aaa" textAnchor="middle">
                            {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </text>
                    )
                })}

                {/* Area fill */}
                <path d={areaD} fill={`url(#grad-${label})`} />
                {/* Line */}
                <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

                {/* Data points */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3.5"
                        fill="white" stroke={color} strokeWidth="2"
                        opacity={tooltip?.idx === i ? 1 : 0.5}
                        style={{ transition: 'opacity 0.1s' }}
                    />
                ))}

                {/* Hover line + tooltip */}
                {tooltip && (
                    <>
                        <line
                            x1={tooltip.x} y1={PAD.top}
                            x2={tooltip.x} y2={H - PAD.bottom}
                            stroke={color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6"
                        />
                        <circle cx={tooltip.x} cy={tooltip.y} r="6"
                            fill={color} stroke="white" strokeWidth="2.5" />
                        {/* Tooltip box */}
                        <g transform={`translate(${Math.min(tooltip.x + 8, W - 120)}, ${Math.max(tooltip.y - 36, PAD.top)})`}>
                            <rect x="0" y="0" width="110" height="46" rx="8" fill="white"
                                stroke={color} strokeWidth="1.5"
                                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }} />
                            <text x="10" y="16" fontSize="10" fill="#888">
                                {new Date(tooltip.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </text>
                            <text x="10" y="34" fontSize="14" fontWeight="700" fill={color}>
                                {tooltip.value}{unit}
                            </text>
                        </g>
                    </>
                )}
            </svg>
        </div>
    )
}

/* ─── Prediction Bar ─── */
function PredictionBar({ label, current, projected, unit, color }) {
    const pct = Math.min(100, (projected / (projected * 1.1)) * 100)
    const curPct = Math.min(100, (current / (projected * 1.1)) * 100)
    const gain = projected - current
    return (
        <div className="pred-bar-row">
            <div className="pred-bar-info">
                <span className="pred-bar-label">{label}</span>
                <span className="pred-bar-values">
                    <span className="pred-current">{current}{unit} now</span>
                    <span className="pred-arrow">→</span>
                    <span className="pred-projected" style={{ color }}>{projected}{unit} in 30d</span>
                </span>
            </div>
            <div className="pred-bar-track">
                <div className="pred-bar-fill pred-bar-fill--now" style={{ width: `${curPct}%`, background: `${color}40` }} />
                <div className="pred-bar-fill pred-bar-fill--future" style={{ width: `${pct}%`, background: color }} />
                <span className="pred-gain" style={{ color }}>+{gain}{unit}</span>
            </div>
        </div>
    )
}

/* ─── Personal Best Card ─── */
function PBCard({ label, value, unit, icon, color, date }) {
    return (
        <div className="pb-card" style={{ '--pb-color': color }}>
            <div className="pb-icon">{icon}</div>
            <div className="pb-body">
                <div className="pb-value">{value}<span className="pb-unit">{unit}</span></div>
                <div className="pb-label">{label}</div>
                {date && <div className="pb-date">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>}
            </div>
        </div>
    )
}

/* ─── Main Component ─── */
export default function ProgressPage() {
    const navigate = useNavigate()
    const { state } = useUser()
    const profile = state.profile

    const [logs, setLogs] = useState([])
    const [totalXP, setTotalXP] = useState(0)
    const [newBadge, setNewBadge] = useState(null)
    const [showBadge, setShowBadge] = useState(false)
    const [activeChart, setActiveChart] = useState('duration')
    const [consistencyDays, setConsistencyDays] = useState(30)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        let workoutLogs = (await getWorkoutLogs()) || []
        // Seed demo data if no real logs
        if (workoutLogs.length < 3) {
            workoutLogs = generateDemoLogs(profile)
        }
        setLogs(workoutLogs)

        let xp = (await getSetting('totalXP')) || 0
        if (xp === 0 && workoutLogs.length > 0) {
            xp = workoutLogs.length * XP_TABLE.workout
            const s = calcStreak(workoutLogs)
            if (s >= 3) xp += XP_TABLE.streak3
            if (s >= 7) xp += XP_TABLE.streak7
            if (s >= 14) xp += XP_TABLE.streak14
            if (s >= 30) xp += XP_TABLE.streak30
            workoutLogs.forEach(l => {
                if (l.debrief) xp += XP_TABLE.debrief
                if (l.mood) xp += XP_TABLE.mood_checkin
            })
            await saveSetting('totalXP', xp)
        }
        setTotalXP(xp)

        const unlockedBadges = (await getSetting('unlockedBadges')) || []
        const data = buildAchData(workoutLogs, xp)
        const newUnlocked = ACHIEVEMENTS.filter(a => a.condition(data) && !unlockedBadges.includes(a.id))
        if (newUnlocked.length > 0) {
            await saveSetting('unlockedBadges', [...unlockedBadges, ...newUnlocked.map(a => a.id)])
            setNewBadge(newUnlocked[0])
            setShowBadge(true)
            setTimeout(() => setShowBadge(false), 4000)
        }
    }

    function buildAchData(wl, xp) {
        return {
            workouts: wl.length,
            streak: calcStreak(wl),
            level: getCurrentLevel(xp).level,
            hasTwin: !!localStorage.getItem('trainingTwin'),
            peakMood: wl.some(l => l.mood === 5),
        }
    }

    function calcStreak(wl) {
        if (!wl.length) return 0
        const dates = [...new Set(wl.map(l => new Date(l.date).toDateString()))].sort((a, b) => new Date(b) - new Date(a))
        let streak = 0, check = new Date()
        for (const d of dates) {
            if (new Date(d).toDateString() === check.toDateString()) { streak++; check.setDate(check.getDate() - 1) } else break
        }
        return streak
    }

    function getCurrentLevel(xp) {
        let cur = LEVELS[0]
        for (const l of LEVELS) { if (xp >= l.xpReq) cur = l }
        return cur
    }
    function getNextLevel(xp) {
        for (const l of LEVELS) { if (xp < l.xpReq) return l }
        return LEVELS[LEVELS.length - 1]
    }

    const streak = useMemo(() => calcStreak(logs), [logs])
    const currentLevel = getCurrentLevel(totalXP)
    const nextLevel = getNextLevel(totalXP)
    const xpProgress = nextLevel.xpReq > currentLevel.xpReq
        ? ((totalXP - currentLevel.xpReq) / (nextLevel.xpReq - currentLevel.xpReq)) * 100
        : 100

    const achievementData = useMemo(() => buildAchData(logs, totalXP), [logs, totalXP])
    const unlockedIds = ACHIEVEMENTS.filter(a => a.condition(achievementData)).map(a => a.id)

    /* ─── Chart data series ─── */
    const CHART_OPTIONS = {
        duration: { label: 'Workout Duration', unit: 'm', color: '#2563EB', key: 'duration' },
        pushups: { label: 'Push-ups', unit: ' reps', color: '#7C3AED', key: 'pushups' },
        squats: { label: 'Squats', unit: ' reps', color: '#059669', key: 'squats' },
        plank: { label: 'Plank Hold', unit: 's', color: '#0891B2', key: 'plankSeconds' },
        mood: { label: 'Mood Score', unit: '/5', color: '#DC2626', key: 'mood' },
    }
    const active = CHART_OPTIONS[activeChart]
    const chartData = useMemo(() => logs
        .filter(l => l[active.key] != null && Number(l[active.key]) > 0)
        .map(l => ({ date: l.date, value: Number(l[active.key]) })),
        [logs, active.key]
    )

    /* ─── Heatmap ─── */
    const heatmapMap = useMemo(() => {
        const m = {}
        logs.forEach(l => { const d = new Date(l.date).toDateString(); m[d] = (m[d] || 0) + 1 })
        return m
    }, [logs])
    const heatmapDays = useMemo(() => {
        const days = []
        for (let i = 27; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i)
            days.push({ date: d, label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), count: heatmapMap[d.toDateString()] || 0 })
        }
        return days
    }, [heatmapMap])

    /* ─── Personal bests ─── */
    const personalBests = useMemo(() => {
        if (!logs.length) return null
        const best = (key) => {
            const valid = logs.filter(l => Number(l[key]) > 0)
            if (!valid.length) return null
            const b = valid.reduce((mx, l) => Number(l[key]) > Number(mx[key]) ? l : mx, valid[0])
            return { value: Number(b[key]), date: b.date }
        }
        return {
            pushups: best('pushups'),
            squats: best('squats'),
            plankSeconds: best('plankSeconds'),
            duration: best('duration'),
        }
    }, [logs])

    /* ─── Extended stats ─── */
    const extStats = useMemo(() => {
        if (!logs.length) return {}
        const total = logs.reduce((s, l) => s + (Number(l.duration) || 0), 0)
        const avgDuration = Math.round(total / logs.length)
        const avgMood = logs.filter(l => l.mood).reduce((s, l, _, a) => s + l.mood / a.length, 0)
        const thisWeek = logs.filter(l => {
            const d = new Date(l.date), now = new Date()
            return (now - d) / 86400000 < 7
        }).length
        return { total, avgDuration, avgMood: avgMood.toFixed(1), thisWeek }
    }, [logs])

    /* ─── Prediction engine ─── */
    const predictions = useMemo(() => {
        if (logs.length < 2) return null
        const recent = logs.slice(-7)
        const avgPushups = Math.round(recent.filter(l => l.pushups).reduce((s, l, _, a) => s + l.pushups / a.length, 0))
        const avgSquats = Math.round(recent.filter(l => l.squats).reduce((s, l, _, a) => s + l.squats / a.length, 0))
        const avgPlank = Math.round(recent.filter(l => l.plankSeconds).reduce((s, l, _, a) => s + l.plankSeconds / a.length, 0))

        // Compound growth model: ~0.8-1.2% improvement per consistent day
        const growthRate = 1 + (consistencyDays * 0.009)

        const basePushups = avgPushups || parseInt(profile?.pushups) || 20
        const baseSquats = avgSquats || parseInt(profile?.squats) || 30
        const basePlank = avgPlank || parseInt(profile?.plankSeconds) || 60

        return {
            pushups: { current: basePushups, projected: Math.round(basePushups * growthRate) },
            squats: { current: baseSquats, projected: Math.round(baseSquats * growthRate) },
            plank: { current: basePlank, projected: Math.round(basePlank * growthRate) },
        }
    }, [logs, profile, consistencyDays])

    return (
        <div className="progress-page">

            {/* Badge notification */}
            {showBadge && newBadge && (
                <div className="badge-popup-overlay" onClick={() => setShowBadge(false)}>
                    <div className="badge-popup glass-card animate-scale-in">
                        <div className="badge-popup-ring" />
                        <div className="badge-popup-title">Achievement Unlocked!</div>
                        <div className="badge-popup-name">{newBadge.name}</div>
                        <div className="badge-popup-desc">{newBadge.description}</div>
                        <div className="badge-popup-xp">+{newBadge.xp} XP</div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="pg-header">
                <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>← Dashboard</button>
                <div className="pg-header-right">
                    <span className="pg-header-xp">{totalXP} XP</span>
                    <div className="pg-header-level" title={currentLevel.name}>Lv.{currentLevel.level}</div>
                </div>
            </div>

            {/* ─── Level + XP ─── */}
            <section className="pg-section">
                <div className="level-card glass-card">
                    <div className="level-card-left">
                        <div className="level-ring">
                            <svg viewBox="0 0 60 60" className="level-ring-svg">
                                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="5" />
                                <circle cx="30" cy="30" r="26" fill="none" stroke="url(#lvlGrad)" strokeWidth="5"
                                    strokeDasharray={`${163 * xpProgress / 100} 163`}
                                    strokeLinecap="round" transform="rotate(-90 30 30)"
                                />
                                <defs>
                                    <linearGradient id="lvlGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#2563EB" />
                                        <stop offset="100%" stopColor="#7C3AED" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="level-ring-num">{currentLevel.level}</span>
                        </div>
                        <div>
                            <div className="level-card-name">{currentLevel.name}</div>
                            <div className="level-card-sub">Level {currentLevel.level}</div>
                        </div>
                    </div>
                    <div className="level-card-right">
                        <div className="xp-header">
                            <span className="xp-total">{totalXP} XP</span>
                            <span className="xp-next">→ {nextLevel.name} at {nextLevel.xpReq} XP</span>
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
            </section>

            {/* ─── Stats row ─── */}
            <section className="pg-section">
                <div className="stats-grid">
                    {[
                        { v: streak, l: 'Day Streak', color: '#DC2626', sub: 'current' },
                        { v: logs.length, l: 'Workouts', color: '#2563EB', sub: 'total' },
                        { v: extStats.thisWeek, l: 'This Week', color: '#059669', sub: 'sessions' },
                        { v: extStats.avgDuration ? `${extStats.avgDuration}m` : '—', l: 'Avg Session', color: '#7C3AED', sub: 'duration' },
                        { v: extStats.avgMood || '—', l: 'Avg Mood', color: '#F59E0B', sub: 'out of 5' },
                        { v: `${unlockedIds.length}/${ACHIEVEMENTS.length}`, l: 'Badges', color: '#0891B2', sub: 'unlocked' },
                    ].map(({ v, l, color, sub }) => (
                        <div key={l} className="stat-tile" style={{ '--s-color': color }}>
                            <div className="stat-tile-val">{v}</div>
                            <div className="stat-tile-label">{l}</div>
                            <div className="stat-tile-sub">{sub}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Personal Bests ─── */}
            {personalBests && (
                <section className="pg-section">
                    <h2 className="pg-section-title">Personal Bests</h2>
                    <div className="pb-grid">
                        {personalBests.pushups && <PBCard label="Push-ups" value={personalBests.pushups.value} unit=" reps" icon="💪" color="#7C3AED" date={personalBests.pushups.date} />}
                        {personalBests.squats && <PBCard label="Squats" value={personalBests.squats.value} unit=" reps" icon="🦵" color="#059669" date={personalBests.squats.date} />}
                        {personalBests.plankSeconds && <PBCard label="Plank Hold" value={personalBests.plankSeconds.value} unit="s" icon="🧘" color="#0891B2" date={personalBests.plankSeconds.date} />}
                        {personalBests.duration && <PBCard label="Longest Session" value={personalBests.duration.value} unit="m" icon="⏱" color="#DC2626" date={personalBests.duration.date} />}
                    </div>
                </section>
            )}

            {/* ─── Interactive Line Chart ─── */}
            <section className="pg-section">
                <div className="chart-header">
                    <h2 className="pg-section-title">Progress Over Time</h2>
                    <div className="chart-tabs">
                        {Object.entries(CHART_OPTIONS).map(([key, c]) => (
                            <button
                                key={key}
                                className={`chart-tab ${activeChart === key ? 'active' : ''}`}
                                onClick={() => setActiveChart(key)}
                                style={{ '--tab-color': c.color }}
                            >
                                {c.label.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="chart-card glass-card">
                    <div className="chart-card-meta">
                        <span className="chart-card-label" style={{ color: active.color }}>{active.label}</span>
                        {chartData.length > 0 && (
                            <span className="chart-card-latest">
                                Latest: <strong>{chartData[chartData.length - 1].value}{active.unit}</strong>
                            </span>
                        )}
                    </div>
                    <LineChart data={chartData} color={active.color} label={active.label} unit={active.unit} />
                </div>
            </section>

            {/* ─── Consistency Predictor ─── */}
            {predictions && (
                <section className="pg-section">
                    <div className="predictor-header">
                        <div>
                            <h2 className="pg-section-title">Consistency Predictor</h2>
                            <p className="pg-section-sub">Stay consistent for {consistencyDays} days — here's where you'll be</p>
                        </div>
                        <div className="predictor-slider-wrap">
                            <span className="predictor-days">{consistencyDays}d</span>
                            <input
                                type="range" min="7" max="90" step="7"
                                value={consistencyDays}
                                onChange={e => setConsistencyDays(Number(e.target.value))}
                                className="predictor-slider"
                            />
                        </div>
                    </div>
                    <div className="predictor-card glass-card">
                        <div className="predictor-badge">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                <polyline points="16 7 22 7 22 13" />
                            </svg>
                            Projected growth at your current trajectory
                        </div>
                        <PredictionBar label="Push-ups" current={predictions.pushups.current} projected={predictions.pushups.projected} unit=" reps" color="#7C3AED" />
                        <PredictionBar label="Squats" current={predictions.squats.current} projected={predictions.squats.projected} unit=" reps" color="#059669" />
                        <PredictionBar label="Plank Hold" current={predictions.plank.current} projected={predictions.plank.projected} unit="s" color="#0891B2" />
                        <p className="predictor-disclaimer">
                            Based on your recent {Math.min(7, logs.length)}-session trend. Assumes you work out at least 5 days/week.
                        </p>
                    </div>
                </section>
            )}

            {/* ─── Activity Heatmap ─── */}
            <section className="pg-section">
                <h2 className="pg-section-title">Activity Heatmap</h2>
                <div className="heatmap-card glass-card">
                    <div className="heatmap-grid">
                        {heatmapDays.map((day, i) => (
                            <div key={i} title={`${day.date.toLocaleDateString()}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                                className={`heatmap-cell ${day.count === 0 ? 'empty' : day.count === 1 ? 'low' : day.count === 2 ? 'med' : 'high'}`}>
                                <span className="heatmap-day-label">{day.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="heatmap-legend">
                        <span>Less</span>
                        {['empty', 'low', 'med', 'high'].map(c => <div key={c} className={`heatmap-cell ${c} legend`} />)}
                        <span>More</span>
                    </div>
                </div>
            </section>

            {/* ─── Achievements ─── */}
            <section className="pg-section">
                <h2 className="pg-section-title">Achievements <span className="ach-count">{unlockedIds.length}/{ACHIEVEMENTS.length}</span></h2>
                <div className="achievements-grid">
                    {ACHIEVEMENTS.map((a) => {
                        const unlocked = unlockedIds.includes(a.id)
                        return (
                            <div key={a.id} className={`achievement-card glass-card ${unlocked ? 'unlocked' : 'locked'}`}>
                                <div className="achievement-icon">{unlocked ? '✓' : '○'}</div>
                                <div className="achievement-info">
                                    <div className="achievement-name">{a.name}</div>
                                    <div className="achievement-desc">{a.description}</div>
                                </div>
                                <div className="achievement-xp">+{a.xp} XP</div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* ─── Recent Workouts ─── */}
            {logs.length > 0 && (
                <section className="pg-section">
                    <h2 className="pg-section-title">Recent Sessions</h2>
                    <div className="recent-list">
                        {logs.slice(-6).reverse().map((log, i) => {
                            const moodLabels = ['Rough', 'Meh', 'OK', 'Good', 'Fired up!']
                            const moodColors = ['#DC2626', '#F59E0B', '#6B7280', '#059669', '#7C3AED']
                            const m = log.mood ? log.mood - 1 : null
                            return (
                                <div key={i} className="recent-item glass-card">
                                    <div className="recent-date-col">
                                        <div className="recent-day">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                                        <div className="recent-date">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                    </div>
                                    <div className="recent-stats">
                                        {log.duration > 0 && <span className="recent-stat">{log.duration}m</span>}
                                        {log.exercisesCompleted > 0 && <span className="recent-stat">{log.exercisesCompleted} ex</span>}
                                        {log.pushups > 0 && <span className="recent-stat">{log.pushups} push-ups</span>}
                                        {log.squats > 0 && <span className="recent-stat">{log.squats} squats</span>}
                                    </div>
                                    {m !== null && (
                                        <span className="recent-mood" style={{ color: moodColors[m] }}>{moodLabels[m]}</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}
        </div>
    )
}
