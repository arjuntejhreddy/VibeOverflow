import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { generateWorkout, findSwap, getTiredAlternative } from '../../utils/exercises'
import { getCoachCue, speakWithPersona } from '../../ai/personas'
import { logWorkout } from '../../db'
import { getExerciseImage } from '../../utils/images'
import './Workout.css'

/* ─────────────────────────── Constants ─────────────────────────── */
const MOOD_SCALE = [
    { val: 1, emoji: '😫', label: 'Rough', intensityMult: 0.6, color: '#6B7280' },
    { val: 2, emoji: '😕', label: 'Meh', intensityMult: 0.8, color: '#9CA3AF' },
    { val: 3, emoji: '😐', label: 'Okay', intensityMult: 1.0, color: '#F59E0B' },
    { val: 4, emoji: '😊', label: 'Good', intensityMult: 1.1, color: '#10B981' },
    { val: 5, emoji: '🔥', label: 'On fire', intensityMult: 1.25, color: '#EF4444' },
]

const PHASES = { MOOD: 'mood', TIME: 'time', PREVIEW: 'preview', ACTIVE: 'active', REST: 'rest', DEBRIEF: 'debrief', COMPLETE: 'complete' }

const COACH_QUIPS = [
    'Breathe — you got this!', 'Perfect form wins every time.', 'One rep at a time.',
    "Consistency > intensity.", 'Your future self is watching.', "Feel the burn — that\u2019s growth.",
    'Stay tall, stay strong.', 'You chose to be here. Make it count.',
    'Slow is smooth. Smooth is fast.', 'Mind-muscle connection.',
]

const REST_TIPS = [
    '💧 Sip some water', '🧘 Shake out your arms', '📸 Check your posture',
    '🌬️ Deep breath in, slow out', '👀 Visualise the next set', '🎵 Lock into the music',
]

/* ─────────────────────────── Growing Tree SVG ─────────────────────────── */
/**
 * progress: 0.0 – 1.0
 * Renders a seedling → sapling → young tree → full canopy tree
 * All paths drawn in SVG, animated via CSS clip / opacity / scale
 */
function GrowingTree({ progress }) {
    // 5 growth stages
    const stage = progress === 0 ? 0 : progress < 0.25 ? 1 : progress < 0.5 ? 2 : progress < 0.75 ? 3 : 4
    const leafGreen = '#22C55E'
    const trunkBrown = '#92400E'
    const darkGreen = '#16A34A'
    const lightGreen = '#86EFAC'

    return (
        <svg viewBox="0 0 120 140" className="tree-svg" aria-label={`Workout progress tree: stage ${stage + 1} of 5`}>
            {/* Ground line */}
            <line x1="20" y1="128" x2="100" y2="128" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />

            {/* ── STAGE 0: Seed/Soil bump ── */}
            <g opacity={1}>
                <ellipse cx="60" cy="127" rx="10" ry="4" fill="rgba(146,64,14,0.35)" />
                {/* tiny sprout if stage >= 0 */}
                {stage >= 0 && (
                    <line x1="60" y1="127" x2="60" y2="118" stroke={trunkBrown} strokeWidth="2" strokeLinecap="round"
                        style={{ transform: 'scaleY(0)', transformOrigin: '60px 127px', transition: 'transform 0.8s ease', ...(stage >= 0 ? { transform: 'scaleY(1)' } : {}) }}
                    />
                )}
            </g>

            {/* ── STAGE 1: Seedling — small stem + 2 tiny leaves ── */}
            <g style={{ opacity: stage >= 1 ? 1 : 0, transition: 'opacity 0.6s 0.2s' }}>
                {/* stem */}
                <line x1="60" y1="127" x2="60" y2="108" stroke={trunkBrown} strokeWidth="2.5" strokeLinecap="round" />
                {/* left leaf */}
                <ellipse cx="53" cy="113" rx="7" ry="4" fill={lightGreen} transform="rotate(-30 53 113)"
                    style={{ transformOrigin: '53px 113px', transform: stage >= 1 ? 'scale(1) rotate(-30deg)' : 'scale(0) rotate(-30deg)', transition: 'transform 0.5s 0.5s' }} />
                {/* right leaf */}
                <ellipse cx="67" cy="113" rx="7" ry="4" fill={leafGreen} transform="rotate(30 67 113)"
                    style={{ transformOrigin: '67px 113px', transform: stage >= 1 ? 'scale(1) rotate(30deg)' : 'scale(0) rotate(30deg)', transition: 'transform 0.5s 0.7s' }} />
            </g>

            {/* ── STAGE 2: Sapling — taller trunk + branching ── */}
            <g style={{ opacity: stage >= 2 ? 1 : 0, transition: 'opacity 0.6s 0.2s' }}>
                <line x1="60" y1="127" x2="60" y2="90" stroke={trunkBrown} strokeWidth="3.5" strokeLinecap="round" />
                {/* Left branch */}
                <line x1="60" y1="102" x2="44" y2="88" stroke={trunkBrown} strokeWidth="2" strokeLinecap="round"
                    style={{ opacity: stage >= 2 ? 1 : 0, transition: 'opacity 0.4s 0.4s' }} />
                {/* Right branch */}
                <line x1="60" y1="98" x2="76" y2="84" stroke={trunkBrown} strokeWidth="2" strokeLinecap="round"
                    style={{ opacity: stage >= 2 ? 1 : 0, transition: 'opacity 0.4s 0.6s' }} />
                {/* Leaf clusters */}
                <circle cx="40" cy="84" r="9" fill={leafGreen}
                    style={{ transform: stage >= 2 ? 'scale(1)' : 'scale(0)', transformOrigin: '40px 84px', transition: 'transform 0.5s 0.5s' }} />
                <circle cx="78" cy="80" r="9" fill={darkGreen}
                    style={{ transform: stage >= 2 ? 'scale(1)' : 'scale(0)', transformOrigin: '78px 80px', transition: 'transform 0.5s 0.7s' }} />
                <circle cx="60" cy="84" r="8" fill={lightGreen}
                    style={{ transform: stage >= 2 ? 'scale(1)' : 'scale(0)', transformOrigin: '60px 84px', transition: 'transform 0.5s 0.6s' }} />
            </g>

            {/* ── STAGE 3: Young tree — solid trunk + fuller canopy ── */}
            <g style={{ opacity: stage >= 3 ? 1 : 0, transition: 'opacity 0.6s 0.2s' }}>
                <line x1="60" y1="127" x2="60" y2="72" stroke={trunkBrown} strokeWidth="5" strokeLinecap="round" />
                <line x1="60" y1="100" x2="36" y2="78" stroke={trunkBrown} strokeWidth="3" strokeLinecap="round" />
                <line x1="60" y1="95" x2="84" y2="74" stroke={trunkBrown} strokeWidth="3" strokeLinecap="round" />
                <line x1="60" y1="90" x2="52" y2="72" stroke={trunkBrown} strokeWidth="2" strokeLinecap="round" />
                <line x1="60" y1="88" x2="68" y2="70" stroke={trunkBrown} strokeWidth="2" strokeLinecap="round" />
                {/* Big canopy */}
                <circle cx="60" cy="64" r="18" fill={darkGreen} style={{ transform: stage >= 3 ? 'scale(1)' : 'scale(0)', transformOrigin: '60px 64px', transition: 'transform 0.5s 0.3s' }} />
                <circle cx="42" cy="72" r="13" fill={leafGreen} style={{ transform: stage >= 3 ? 'scale(1)' : 'scale(0)', transformOrigin: '42px 72px', transition: 'transform 0.5s 0.5s' }} />
                <circle cx="78" cy="70" r="13" fill={leafGreen} style={{ transform: stage >= 3 ? 'scale(1)' : 'scale(0)', transformOrigin: '78px 70px', transition: 'transform 0.5s 0.6s' }} />
                <circle cx="60" cy="56" r="14" fill={lightGreen} style={{ transform: stage >= 3 ? 'scale(1)' : 'scale(0)', transformOrigin: '60px 56px', transition: 'transform 0.5s 0.4s' }} />
            </g>

            {/* ── STAGE 4: Full tree — majestic canopy, birds ── */}
            <g style={{ opacity: stage >= 4 ? 1 : 0, transition: 'opacity 0.7s 0.2s' }}>
                {/* thick trunk */}
                <line x1="56" y1="127" x2="56" y2="60" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
                <line x1="64" y1="127" x2="64" y2="60" stroke={trunkBrown} strokeWidth="4" strokeLinecap="round" />
                {/* Side branches */}
                <line x1="60" y1="95" x2="28" y2="65" stroke={trunkBrown} strokeWidth="3.5" strokeLinecap="round" />
                <line x1="60" y1="90" x2="92" y2="62" stroke={trunkBrown} strokeWidth="3.5" strokeLinecap="round" />
                <line x1="60" y1="80" x2="42" y2="58" stroke={trunkBrown} strokeWidth="2.5" strokeLinecap="round" />
                <line x1="60" y1="80" x2="78" y2="55" stroke={trunkBrown} strokeWidth="2.5" strokeLinecap="round" />
                {/* Massive canopy */}
                <circle cx="60" cy="52" r="25" fill={darkGreen} />
                <circle cx="36" cy="68" r="17" fill={leafGreen} />
                <circle cx="84" cy="66" r="16" fill={darkGreen} />
                <circle cx="46" cy="54" r="15" fill={leafGreen} />
                <circle cx="74" cy="52" r="15" fill={'#4ADE80'} />
                <circle cx="60" cy="38" r="18" fill={lightGreen} />
                <circle cx="60" cy="30" r="12" fill={'#86EFAC'} />
                {/* Sparkle dots on full tree */}
                {[[46, 28], [74, 26], [30, 60], [90, 58]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="2.5" fill="white" opacity="0.7"
                        className="tree-sparkle" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
                {/* Birds */}
                <path d="M22 45 Q24 42 26 45" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round" className="tree-bird" />
                <path d="M95 40 Q97 37 99 40" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round" className="tree-bird" style={{ animationDelay: '0.5s' }} />
            </g>

            {/* Progress % label */}
            <text x="60" y="140" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)" fontWeight="700">
                {Math.round(progress * 100)}%
            </text>
        </svg>
    )
}

/* ─────────────────────────── Circular Rest Timer ─────────────────────────── */
function RestRing({ seconds, total, tip }) {
    const R = 42, C = 2 * Math.PI * R
    const pct = total > 0 ? seconds / total : 0
    return (
        <div className="rest-ring-wrap">
            <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                <circle cx="55" cy="55" r={R} fill="none" stroke="#2563EB" strokeWidth="7"
                    strokeDasharray={`${pct * C} ${C}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                    style={{ transition: 'stroke-dasharray 1s linear' }}
                />
                <text x="55" y="53" textAnchor="middle" fontSize="22" fontWeight="900" fill="white">{seconds}</text>
                <text x="55" y="66" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)" fontWeight="600">SEC</text>
            </svg>
            <p className="rest-tip">{tip}</p>
        </div>
    )
}

/* ─────────────────────────── ExerciseBadge (muscle tag) ─────────────────────────── */
function MuscleBadge({ muscle }) {
    const colors = {
        chest: '#3B82F6', back: '#8B5CF6', legs: '#10B981', shoulders: '#F59E0B',
        arms: '#EF4444', core: '#EC4899', glutes: '#F97316', cardio: '#06B6D4',
    }
    const key = Object.keys(colors).find(k => (muscle || '').toLowerCase().includes(k)) || 'core'
    return <span className="muscle-badge" style={{ background: `${colors[key]}22`, color: colors[key] }}>{muscle}</span>
}

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function WorkoutSession() {
    const navigate = useNavigate()
    const { state } = useUser()
    const { profile } = state

    const [phase, setPhase] = useState(PHASES.MOOD)
    const [mood, setMood] = useState(3)
    const [duration, setDuration] = useState(30)
    const [workout, setWorkout] = useState(null)
    const [currentIdx, setCurrentIdx] = useState(-1)
    const [currentSet, setCurrentSet] = useState(1)
    const [timer, setTimer] = useState(0)
    const [restTotal, setRestTotal] = useState(30)
    const [restTip, setRestTip] = useState(REST_TIPS[0])
    const [midState, setMidState] = useState(null)
    const [debrief, setDebrief] = useState({ energy: 3, soreness: 3, mood: 3 })
    const [exercisesCompleted, setExercisesCompleted] = useState(0)
    const [swapLog, setSwapLog] = useState([])
    const [quip, setQuip] = useState(COACH_QUIPS[0])
    const [celebrate, setCelebrate] = useState(false)  // brief flash after completing exercise
    const [workoutStartTime, setWorkoutStartTime] = useState(null)
    const timerRef = useRef(null)
    const quipRef = useRef(null)

    const persona = profile?.coachPersona || 'hype'

    /* Rotate quip every 8s */
    useEffect(() => {
        if (phase !== PHASES.ACTIVE) return
        quipRef.current = setInterval(() => {
            setQuip(COACH_QUIPS[Math.floor(Math.random() * COACH_QUIPS.length)])
        }, 8000)
        return () => clearInterval(quipRef.current)
    }, [phase])

    function generatePreview() {
        const w = generateWorkout(profile, duration)
        setWorkout(w)
        setPhase(PHASES.PREVIEW)
    }

    function startActiveWorkout() {
        setCurrentIdx(-1)
        setCurrentSet(1)
        setPhase(PHASES.ACTIVE)
        setTimer(0)
        setWorkoutStartTime(Date.now())
        speakWithPersona(getCoachCue(persona, 'start'), persona)
        setQuip(COACH_QUIPS[Math.floor(Math.random() * COACH_QUIPS.length)])
    }

    /* REST countdown */
    useEffect(() => {
        if (phase !== PHASES.REST) { clearInterval(timerRef.current); return }
        setRestTip(REST_TIPS[Math.floor(Math.random() * REST_TIPS.length)])
        timerRef.current = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current)
                    setCurrentSet(s => s + 1)
                    setPhase(PHASES.ACTIVE)
                    speakWithPersona(getCoachCue(persona, 'rep'), persona)
                    return 0
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [phase, persona])

    function skipRest() {
        clearInterval(timerRef.current)
        setTimer(0)
        setCurrentSet(s => s + 1)
        setPhase(PHASES.ACTIVE)
        speakWithPersona(getCoachCue(persona, 'rep'), persona)
    }

    const getCurrentExercise = useCallback(() => {
        if (!workout) return null
        if (currentIdx === -1) return workout.warmup
        if (currentIdx >= workout.exercises.length) return workout.cooldown
        return workout.exercises[currentIdx]
    }, [workout, currentIdx])

    function nextAction() {
        if (!workout) return
        const exercise = getCurrentExercise()
        const totalSets = exercise?.sets || 1  // each exercise done ONCE (1 set per round)

        if (currentIdx === -1) {
            // After warmup → first exercise
            setCurrentIdx(0); setCurrentSet(1); setTimer(0)
            speakWithPersona(getCoachCue(persona, 'rep'), persona)
            return
        }

        if (currentIdx >= workout.exercises.length) {
            finishWorkout(); return
        }

        if (currentSet < totalSets) {
            // Need rest before next set
            const restTime = 30
            setPhase(PHASES.REST); setTimer(restTime); setRestTotal(restTime)
            speakWithPersona(getCoachCue(persona, 'rest'), persona)
            return
        }

        // Move to next exercise — trigger celebrate flash
        setCelebrate(true)
        setTimeout(() => setCelebrate(false), 900)
        setExercisesCompleted(c => c + 1)

        if (currentIdx + 1 >= workout.exercises.length) {
            // Go to cooldown
            setCurrentIdx(workout.exercises.length); setCurrentSet(1); setTimer(0)
            speakWithPersona(getCoachCue(persona, 'encouragement'), persona)
        } else {
            setCurrentIdx(i => i + 1); setCurrentSet(1); setTimer(0)
            speakWithPersona(getCoachCue(persona, 'rep'), persona)
        }
        setPhase(PHASES.ACTIVE)
    }

    function handleMidState(s) {
        setMidState(s)
        if (s === 'stop') {
            speakWithPersona(getCoachCue(persona, 'rageQuit'), persona)
            finishWorkout()
        } else if (s === 'break') {
            setPhase(PHASES.REST); setTimer(60); setRestTotal(60)
        }
    }

    function swapExercise(exerciseId) {
        const newEx = findSwap(exerciseId, profile?.injuries)
        if (newEx && workout) {
            const updated = { ...workout }
            const idx = updated.exercises.findIndex(e => e.id === exerciseId)
            if (idx !== -1) {
                updated.exercises[idx] = { ...newEx, sets: updated.exercises[idx].sets, reps: updated.exercises[idx].reps }
                setWorkout(updated)
                setSwapLog(l => [...l, { from: exerciseId, to: newEx.id }])
            }
        }
    }

    function useTiredAlt(exerciseId) {
        const alt = getTiredAlternative(exerciseId)
        if (alt && workout) {
            const updated = { ...workout }
            const idx = updated.exercises.findIndex(e => e.id === exerciseId)
            if (idx !== -1) {
                updated.exercises[idx] = { ...alt, sets: updated.exercises[idx].sets, reps: updated.exercises[idx].reps }
                setWorkout(updated)
            }
        }
    }

    function finishWorkout() {
        clearInterval(timerRef.current)
        clearInterval(quipRef.current)
        setPhase(PHASES.DEBRIEF)
        speakWithPersona(getCoachCue(persona, 'complete'), persona)
    }

    async function saveAndExit() {
        const elapsedMin = workoutStartTime ? Math.round((Date.now() - workoutStartTime) / 60000) : duration
        await logWorkout({
            date: new Date().toISOString(),
            mood,
            duration: elapsedMin,
            exercisesCompleted,
            debrief,
            midState,
            swaps: swapLog,
        })
        setPhase(PHASES.COMPLETE)
    }

    const exercise = getCurrentExercise()

    /* ── Computed progress (0–1) for the tree ── */
    const treeProgress = useMemo(() => {
        if (!workout) return 0
        const total = workout.exercises.length
        if (total === 0) return 0
        if (currentIdx === -1) return 0
        if (currentIdx >= total) return 1
        return (exercisesCompleted) / total
    }, [workout, currentIdx, exercisesCompleted])

    /* ══════════════════════ MOOD CHECK-IN ══════════════════════ */
    if (phase === PHASES.MOOD) {
        const selected = MOOD_SCALE.find(m => m.val === mood)
        return (
            <div className="wo-page">
                <div className="wo-container">
                    <div className="wo-step-header">
                        <span className="wo-step-badge">Step 1 of 2</span>
                        <h2 className="wo-title">How are you feeling?</h2>
                        <p className="wo-subtitle">We'll tune the intensity to match your energy.</p>
                    </div>

                    <div className="mood-grid">
                        {MOOD_SCALE.map(m => (
                            <button key={m.val}
                                className={`mood-card ${mood === m.val ? 'selected' : ''}`}
                                style={{ '--mood-color': m.color }}
                                onClick={() => setMood(m.val)}
                            >
                                <span className="mood-card-emoji">{m.emoji}</span>
                                <span className="mood-card-label">{m.label}</span>
                                {mood === m.val && <span className="mood-card-check">✓</span>}
                            </button>
                        ))}
                    </div>

                    {selected && (
                        <div className="mood-feedback" style={{ borderColor: selected.color + '44', background: selected.color + '11' }}>
                            Intensity multiplier: <strong style={{ color: selected.color }}>{selected.intensityMult}×</strong>
                            <span className="mood-feedback-sub">— your workout adapts automatically</span>
                        </div>
                    )}

                    <button className="wo-cta" onClick={() => setPhase(PHASES.TIME)}>
                        Continue →
                    </button>
                </div>
            </div>
        )
    }

    /* ══════════════════════ TIME SELECTOR ══════════════════════ */
    if (phase === PHASES.TIME) {
        return (
            <div className="wo-page">
                <div className="wo-container">
                    <div className="wo-step-header">
                        <span className="wo-step-badge">Step 2 of 2</span>
                        <h2 className="wo-title">How long do you have?</h2>
                        <p className="wo-subtitle">We'll build the highest-impact workout that fits your window.</p>
                    </div>

                    <div className="time-grid">
                        {[10, 15, 20, 30, 45, 60].map(t => (
                            <button key={t}
                                className={`time-card ${duration === t ? 'selected' : ''}`}
                                onClick={() => setDuration(t)}
                            >
                                <span className="time-card-val">{t}</span>
                                <span className="time-card-unit">min</span>
                                {t <= 15 && <span className="time-card-tag">Quick</span>}
                                {t === 30 && <span className="time-card-tag popular">Popular</span>}
                                {t >= 45 && <span className="time-card-tag beast">Beast</span>}
                            </button>
                        ))}
                    </div>

                    <div className="wo-row-btns">
                        <button className="wo-back-btn" onClick={() => setPhase(PHASES.MOOD)}>← Back</button>
                        <button className="wo-cta flex1" onClick={generatePreview}>Build My Workout →</button>
                    </div>
                </div>
            </div>
        )
    }

    /* ══════════════════════ PREVIEW ══════════════════════ */
    if (phase === PHASES.PREVIEW && workout) {
        return (
            <div className="wo-page">
                <div className="wo-container">
                    <button className="wo-back-btn" style={{ marginBottom: 'var(--space-5)' }} onClick={() => setPhase(PHASES.TIME)}>← Back</button>
                    <h2 className="wo-title">Your Workout</h2>
                    <p className="wo-subtitle">{workout.exercises.length} exercises · {duration} min · Intensity matched to your mood</p>

                    {/* Exercise flow strip */}
                    <div className="preview-flow">
                        <div className="preview-flow-item warmup-pill">🔥 Warm-up</div>
                        {workout.exercises.map((_, i) => (
                            <React.Fragment key={i}>
                                <div className="preview-flow-arrow">→</div>
                                <div className="preview-flow-item">{i + 1}</div>
                            </React.Fragment>
                        ))}
                        <div className="preview-flow-arrow">→</div>
                        <div className="preview-flow-item cooldown-pill">🧊 Cool-down</div>
                    </div>

                    <div className="preview-list">
                        {workout.exercises.map((ex, i) => (
                            <div key={i} className="preview-card">
                                <div className="preview-card-num">{i + 1}</div>
                                <img src={getExerciseImage(ex.id)} alt={ex.name} className="preview-card-img"
                                    onError={e => { e.target.style.display = 'none' }} />
                                <div className="preview-card-info">
                                    <div className="preview-card-name">{ex.name}</div>
                                    <div className="preview-card-meta">
                                        {ex.muscles?.slice(0, 2).map(m => <MuscleBadge key={m} muscle={m} />)}
                                        <span className="preview-sets-chip">{ex.sets}×{ex.reps}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="wo-cta" style={{ marginTop: 'var(--space-6)' }} onClick={startActiveWorkout}>
                        Let's Go 💪
                    </button>
                </div>
            </div>
        )
    }

    /* ══════════════════════ ACTIVE / REST ══════════════════════ */
    if (phase === PHASES.ACTIVE || phase === PHASES.REST) {
        const isWarmup = currentIdx === -1
        const isCooldown = workout && currentIdx >= workout.exercises.length
        const totalEx = workout?.exercises.length || 0
        const linearPct = isWarmup ? 0 : isCooldown ? 100 : ((exercisesCompleted) / totalEx) * 100
        const moodColor = MOOD_SCALE.find(m => m.val === mood)?.color || '#2563EB'

        return (
            <div className="wo-active-page">

                {/* ── Top bar ── */}
                <div className="wo-topbar">
                    <div className="wo-progress-track">
                        <div className="wo-progress-fill" style={{ width: `${linearPct}%`, background: moodColor }} />
                    </div>
                    <div className="wo-topbar-row">
                        <span className="wo-ex-label">
                            {isWarmup ? '🔥 Warm-up' : isCooldown ? '🧊 Cool-down' : `Exercise ${exercisesCompleted + 1} / ${totalEx}`}
                        </span>
                        <button className="wo-end-btn" onClick={() => { clearInterval(timerRef.current); clearInterval(quipRef.current); navigate('/dashboard') }}>
                            End ✕
                        </button>
                    </div>
                </div>

                {/* ── Tree + exercise card layout ── */}
                <div className="wo-main">

                    {/* Left: Growing tree */}
                    <div className="wo-tree-col">
                        <div className={`wo-tree-wrap ${celebrate ? 'celebrate' : ''}`}>
                            <GrowingTree progress={treeProgress} />
                        </div>
                        <div className="wo-tree-caption">
                            {treeProgress === 0 ? 'Seedling' : treeProgress < 0.25 ? 'Sprouting' : treeProgress < 0.5 ? 'Growing' : treeProgress < 0.75 ? 'Thriving' : treeProgress < 1 ? 'Blossoming' : '🌳 Full Tree!'}
                        </div>
                    </div>

                    {/* Right: Exercise card or Rest screen */}
                    <div className="wo-card-col">
                        {phase === PHASES.REST ? (
                            <div className="rest-card">
                                <div className="rest-card-title">Rest Up</div>
                                <RestRing seconds={timer} total={restTotal} tip={restTip} />
                                <p className="rest-next-hint">
                                    Set {currentSet} of {exercise?.sets || 1} coming right up
                                </p>
                                <button className="wo-skip-btn" onClick={skipRest}>Skip Rest →</button>
                            </div>
                        ) : (
                            <div className={`exercise-card ${celebrate ? 'flash' : ''}`}>
                                {/* Exercise image */}
                                <div className="ex-img-wrap">
                                    {exercise?.id && (
                                        <img src={getExerciseImage(exercise.id)} alt={exercise?.name} className="ex-img"
                                            onError={e => { e.target.style.opacity = '0.2' }} />
                                    )}
                                    <div className="ex-img-fade" />
                                </div>

                                {/* Phase label */}
                                <div className="ex-phase-tag" style={{ background: isWarmup ? '#F59E0B22' : isCooldown ? '#06B6D422' : '#2563EB22', color: isWarmup ? '#F59E0B' : isCooldown ? '#06B6D4' : '#2563EB' }}>
                                    {isWarmup ? 'WARM-UP' : isCooldown ? 'COOL-DOWN' : `SET ${currentSet}`}
                                </div>

                                {/* Name + reps */}
                                <h2 className="ex-name">{exercise?.name}</h2>
                                {exercise?.reps && (
                                    <div className="ex-reps">
                                        <span className="ex-reps-num">{exercise.reps}</span>
                                        <span className="ex-reps-unit">{typeof exercise.reps === 'number' ? 'reps' : ''}</span>
                                    </div>
                                )}

                                {/* Muscle badges */}
                                {exercise?.muscles && (
                                    <div className="ex-muscles">
                                        {exercise.muscles.slice(0, 3).map(m => <MuscleBadge key={m} muscle={m} />)}
                                    </div>
                                )}

                                {/* Rotating coach quip */}
                                {!isWarmup && !isCooldown && (
                                    <div className="ex-quip">"{quip}"</div>
                                )}

                                {/* Tired alt */}
                                {exercise?.tiredAlt && !isWarmup && !isCooldown && (
                                    <button className="tired-alt-btn" onClick={() => useTiredAlt(exercise.id)}>
                                        😩 Easier alternative
                                    </button>
                                )}

                                {/* Action row */}
                                <div className="ex-actions">
                                    {!isWarmup && !isCooldown && (
                                        <button className="ex-swap-btn" onClick={() => swapExercise(exercise.id)}>🔄 Swap</button>
                                    )}
                                    <button className="ex-done-btn" style={{ '--done-color': moodColor }} onClick={nextAction}>
                                        {isWarmup ? 'Start Exercises →' : isCooldown ? 'Finish ✓' : 'Done ✓'}
                                    </button>
                                </div>

                                {/* Mid-workout state buttons */}
                                {!isWarmup && !isCooldown && (
                                    <div className="mid-bar">
                                        <button className={`mid-btn ${midState === 'strong' ? 'active' : ''}`} onClick={() => handleMidState('strong')}>💪 Strong</button>
                                        <button className={`mid-btn ${midState === 'break' ? 'active' : ''}`} onClick={() => handleMidState('break')}>⏸ Break</button>
                                        <button className={`mid-btn stop ${midState === 'stop' ? 'active' : ''}`} onClick={() => handleMidState('stop')}>🛑 Stop</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Celebration confetti pop */}
                {celebrate && <div className="confetti-burst" aria-hidden="true">
                    {['🎉', '✨', '⚡', '🌟', '💥'].map((e, i) => (
                        <span key={i} className="confetti-piece" style={{ left: `${15 + i * 18}%`, animationDelay: `${i * 0.08}s` }}>{e}</span>
                    ))}
                </div>}
            </div>
        )
    }

    /* ══════════════════════ DEBRIEF ══════════════════════ */
    if (phase === PHASES.DEBRIEF) {
        const DEBRIEF_ROWS = [
            { key: 'energy', label: 'Energy level', icons: ['😫', '😕', '😐', '😊', '⚡'] },
            { key: 'soreness', label: 'Soreness', icons: ['😌', '🙂', '😬', '😰', '🤕'] },
            { key: 'mood', label: 'Mood after', icons: ['😞', '😕', '😐', '😊', '🤩'] },
        ]
        return (
            <div className="wo-page">
                <div className="wo-container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>
                        <div style={{ fontSize: '3rem' }}>🌳</div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 700 }}>Your tree grew today!</p>
                    </div>
                    <h2 className="wo-title" style={{ textAlign: 'center' }}>How'd that go?</h2>
                    <p className="wo-subtitle" style={{ textAlign: 'center' }}>Quick debrief — feeds tomorrow's plan.</p>

                    <div className="debrief-grid">
                        {DEBRIEF_ROWS.map(row => (
                            <div key={row.key} className="debrief-row">
                                <div className="debrief-row-label">{row.label}</div>
                                <div className="debrief-row-icons">
                                    {row.icons.map((icon, v) => (
                                        <button key={v}
                                            className={`debrief-icon-btn ${debrief[row.key] === v + 1 ? 'selected' : ''}`}
                                            onClick={() => setDebrief(d => ({ ...d, [row.key]: v + 1 }))}
                                        >{icon}</button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="wo-cta" style={{ marginTop: 'var(--space-6)' }} onClick={saveAndExit}>
                        Save & Finish ✓
                    </button>
                </div>
            </div>
        )
    }

    /* ══════════════════════ COMPLETE ══════════════════════ */
    if (phase === PHASES.COMPLETE) {
        return (
            <div className="wo-page">
                <div className="wo-container" style={{ textAlign: 'center' }}>
                    {/* Full grown tree */}
                    <div className="complete-tree-wrap">
                        <GrowingTree progress={1} />
                    </div>
                    <h2 className="wo-title">You grew your tree! 🌳</h2>
                    <p className="wo-subtitle">
                        {exercisesCompleted} exercises crushed  ·  {duration} min session logged
                    </p>

                    <div className="complete-stats">
                        <div className="complete-stat">
                            <span className="cs-val">{exercisesCompleted}</span>
                            <span className="cs-label">Exercises</span>
                        </div>
                        <div className="complete-stat">
                            <span className="cs-val">{duration}</span>
                            <span className="cs-label">Minutes</span>
                        </div>
                        <div className="complete-stat">
                            <span className="cs-val">{MOOD_SCALE.find(m => m.val === mood)?.emoji}</span>
                            <span className="cs-label">Started as</span>
                        </div>
                    </div>

                    <button className="wo-cta" onClick={() => navigate('/dashboard')} style={{ marginTop: 'var(--space-6)' }}>
                        Back to Dashboard →
                    </button>
                    <button className="wo-back-btn" onClick={() => navigate('/progress')} style={{ marginTop: 'var(--space-3)', width: '100%', justifyContent: 'center' }}>
                        View Progress →
                    </button>
                </div>
            </div>
        )
    }

    return null
}
