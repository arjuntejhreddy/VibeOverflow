import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { generateWorkout, getExerciseById, findSwap, getTiredAlternative } from '../../utils/exercises'
import { getCoachCue, speakWithPersona } from '../../ai/personas'
import { logWorkout } from '../../db'
import { getExerciseImage, MUSCLE_IMAGES } from '../../utils/images'
import './Workout.css'

const MOOD_SCALE = [
    { val: 1, emoji: '😫', label: 'Terrible', intensityMult: 0.6 },
    { val: 2, emoji: '😕', label: 'Low', intensityMult: 0.75 },
    { val: 3, emoji: '😐', label: 'Okay', intensityMult: 1.0 },
    { val: 4, emoji: '😊', label: 'Good', intensityMult: 1.1 },
    { val: 5, emoji: '🔥', label: 'FIRED UP', intensityMult: 1.25 },
]

const PHASES = {
    MOOD: 'mood',
    TIME: 'time',
    PREVIEW: 'preview',
    ACTIVE: 'active',
    REST: 'rest',
    DEBRIEF: 'debrief',
    COMPLETE: 'complete',
}

export default function WorkoutSession() {
    const navigate = useNavigate()
    const { state } = useUser()
    const { profile } = state

    const [phase, setPhase] = useState(PHASES.MOOD)
    const [mood, setMood] = useState(3)
    const [duration, setDuration] = useState(30)
    const [workout, setWorkout] = useState(null)
    const [currentIdx, setCurrentIdx] = useState(-1) // -1 = warmup
    const [currentSet, setCurrentSet] = useState(1)
    const [timer, setTimer] = useState(0)
    const [midState, setMidState] = useState(null) // 'strong' | 'break' | 'stop'
    const [debrief, setDebrief] = useState({ energy: 3, soreness: 3, mood: 3 })
    const [exercisesCompleted, setExercisesCompleted] = useState(0)
    const [swapLog, setSwapLog] = useState([])
    const timerRef = useRef(null)

    const persona = profile.coachPersona || 'hype'

    // Generate workout and show preview
    function generatePreview() {
        const w = generateWorkout(profile, duration)
        setWorkout(w)
        setPhase(PHASES.PREVIEW)
    }

    // Start active workout from preview
    function startActiveWorkout() {
        setCurrentIdx(-1)
        setCurrentSet(1)
        setPhase(PHASES.ACTIVE)
        setTimer(0)
        speakWithPersona(getCoachCue(persona, 'start'), persona)
    }

    // Single unified REST countdown timer
    useEffect(() => {
        if (phase !== PHASES.REST) {
            clearInterval(timerRef.current)
            return
        }
        timerRef.current = setInterval(() => {
            setTimer((t) => {
                if (t <= 1) {
                    clearInterval(timerRef.current)
                    // Timer done — advance to next set
                    setCurrentSet((s) => s + 1)
                    setPhase(PHASES.ACTIVE)
                    speakWithPersona(getCoachCue(persona, 'rep'), persona)
                    return 0
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [phase, persona])

    // Skip rest — advance immediately
    function skipRest() {
        clearInterval(timerRef.current)
        setTimer(0)
        setCurrentSet((s) => s + 1)
        setPhase(PHASES.ACTIVE)
        speakWithPersona(getCoachCue(persona, 'rep'), persona)
    }

    // Get current exercise
    const getCurrentExercise = useCallback(() => {
        if (!workout) return null
        if (currentIdx === -1) return workout.warmup
        if (currentIdx >= workout.exercises.length) return workout.cooldown
        return workout.exercises[currentIdx]
    }, [workout, currentIdx])

    // Move to next exercise or set
    function nextAction() {
        if (!workout) return
        const exercise = getCurrentExercise()

        if (currentIdx === -1) {
            // After warmup → first exercise
            setCurrentIdx(0)
            setCurrentSet(1)
            setTimer(0)
            speakWithPersona(getCoachCue(persona, 'rep'), persona)
            return
        }

        if (currentIdx >= workout.exercises.length) {
            // After cooldown → complete
            finishWorkout()
            return
        }

        const totalSets = exercise?.sets || 3
        if (currentSet < totalSets) {
            // Next set — rest first
            setPhase(PHASES.REST)
            setTimer(30)
            speakWithPersona(getCoachCue(persona, 'rest'), persona)
            return
        }

        // Next exercise
        setExercisesCompleted((c) => c + 1)
        if (currentIdx + 1 >= workout.exercises.length) {
            // Go to cooldown
            setCurrentIdx(workout.exercises.length)
            setCurrentSet(1)
            setTimer(0)
            speakWithPersona(getCoachCue(persona, 'encouragement'), persona)
        } else {
            setCurrentIdx((i) => i + 1)
            setCurrentSet(1)
            setTimer(0)
            speakWithPersona(getCoachCue(persona, 'rep'), persona)
        }
        setPhase(PHASES.ACTIVE)
    }

    // Handle mid-workout state
    function handleMidState(s) {
        setMidState(s)
        if (s === 'stop') {
            speakWithPersona(getCoachCue(persona, 'rageQuit'), persona)
            finishWorkout()
        } else if (s === 'break') {
            setPhase(PHASES.REST)
            setTimer(60)
        }
    }

    // Swap exercise
    function swapExercise(exerciseId) {
        const newEx = findSwap(exerciseId, profile.injuries)
        if (newEx && workout) {
            const updated = { ...workout }
            const idx = updated.exercises.findIndex((e) => e.id === exerciseId)
            if (idx !== -1) {
                updated.exercises[idx] = { ...newEx, sets: updated.exercises[idx].sets, reps: updated.exercises[idx].reps }
                setWorkout(updated)
                setSwapLog((l) => [...l, { from: exerciseId, to: newEx.id }])
            }
        }
    }

    // Use tired alternative
    function useTiredAlt(exerciseId) {
        const alt = getTiredAlternative(exerciseId)
        if (alt && workout) {
            const updated = { ...workout }
            const idx = updated.exercises.findIndex((e) => e.id === exerciseId)
            if (idx !== -1) {
                updated.exercises[idx] = { ...alt, sets: updated.exercises[idx].sets, reps: updated.exercises[idx].reps }
                setWorkout(updated)
            }
        }
    }

    // Finish workout
    function finishWorkout() {
        clearInterval(timerRef.current)
        setPhase(PHASES.DEBRIEF)
        speakWithPersona(getCoachCue(persona, 'complete'), persona)
    }

    // Save and exit
    async function saveAndExit() {
        await logWorkout({
            date: new Date().toISOString(),
            mood,
            duration,
            exercisesCompleted,
            debrief,
            midState,
            swaps: swapLog,
        })
        setPhase(PHASES.COMPLETE)
    }

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
    const exercise = getCurrentExercise()

    // === MOOD CHECK-IN ===
    if (phase === PHASES.MOOD) {
        return (
            <div className="workout-page">
                <div className="workout-container">
                    <h2 className="step-title">How are you feeling?</h2>
                    <p className="step-subtitle">This adjusts your workout intensity automatically.</p>
                    <div className="mood-scale">
                        {MOOD_SCALE.map((m) => (
                            <button
                                key={m.val}
                                className={`mood-btn ${mood === m.val ? 'selected' : ''}`}
                                onClick={() => setMood(m.val)}
                            >
                                <span className="mood-emoji">{m.emoji}</span>
                                <span className="mood-label">{m.label}</span>
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-6)' }} onClick={() => setPhase(PHASES.TIME)}>
                        Continue →
                    </button>
                </div>
            </div>
        )
    }

    // === TIME SELECTOR ===
    if (phase === PHASES.TIME) {
        return (
            <div className="workout-page">
                <div className="workout-container">
                    <h2 className="step-title">I only have...</h2>
                    <p className="step-subtitle">We'll build the highest-impact workout that fits your time.</p>
                    <div className="time-selector">
                        {[10, 15, 20, 30, 45, 60].map((t) => (
                            <button
                                key={t}
                                className={`time-btn ${duration === t ? 'selected' : ''}`}
                                onClick={() => setDuration(t)}
                            >
                                <span className="time-value">{t}</span>
                                <span className="time-unit">min</span>
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                        <button className="btn btn-ghost" onClick={() => setPhase(PHASES.MOOD)}>← Back</button>
                        <button className="btn btn-accent btn-lg" style={{ flex: 1 }} onClick={generatePreview}>
                            Preview Workout →
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // === PREVIEW ===
    if (phase === PHASES.PREVIEW && workout) {
        return (
            <div className="workout-page">
                <div className="bg-gradient-mesh" />
                <div className="workout-container">
                    <button className="btn btn-ghost" onClick={() => setPhase(PHASES.TIME)} style={{ marginBottom: 'var(--space-4)' }}>← Back</button>
                    <h2 className="step-title">Your Workout Plan</h2>
                    <p className="step-subtitle">{workout.exercises.length} exercises · {duration} minutes · Adjusted for your mood</p>

                    <div className="preview-exercise-list">
                        {workout.exercises.map((ex, i) => (
                            <div key={i} className="preview-exercise-card glass-card">
                                <img src={getExerciseImage(ex.id)} alt={ex.name} className="preview-exercise-img" />
                                <div className="preview-exercise-info">
                                    <div className="preview-exercise-name">{ex.name}</div>
                                    <div className="preview-exercise-meta">
                                        <span className="badge badge-primary">{ex.muscles?.[0] || 'Full Body'}</span>
                                        <span className="preview-sets">{ex.sets}×{ex.reps}</span>
                                    </div>
                                    {ex.why && <p className="preview-exercise-why">{ex.why}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 'var(--space-6)' }} onClick={startActiveWorkout}>
                        Start Workout →
                    </button>
                </div>
            </div>
        )
    }

    // === ACTIVE WORKOUT / REST ===
    if (phase === PHASES.ACTIVE || phase === PHASES.REST) {
        const isWarmup = currentIdx === -1
        const isCooldown = workout && currentIdx >= workout.exercises.length
        const totalExercises = workout?.exercises.length || 0
        const progress = isWarmup ? 0 : isCooldown ? 100 : ((currentIdx + 1) / totalExercises) * 100

        return (
            <div className="workout-page">
                {/* Progress */}
                <div className="workout-top-bar">
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="workout-top-info">
                        <span>{isWarmup ? 'Warm-up' : isCooldown ? 'Cool-down' : `Exercise ${currentIdx + 1} / ${totalExercises}`}</span>
                        <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)' }} onClick={() => { clearInterval(timerRef.current); navigate('/dashboard') }}>
                            ✕ End
                        </button>
                    </div>
                </div>

                <div className="workout-container workout-active-content">
                    {phase === PHASES.REST ? (
                        <div className="rest-screen">
                            <div className="rest-timer">{timer}</div>
                            <div className="rest-label">Rest</div>
                            <p className="rest-hint">Set {currentSet} of {exercise?.sets || 3} coming up</p>
                            <button className="btn btn-secondary" onClick={skipRest}>
                                Skip Rest →
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="exercise-display">
                                {exercise?.id && (
                                    <img src={getExerciseImage(exercise.id)} alt={exercise.name} className="exercise-hero-img" />
                                )}
                                <div className="exercise-phase-label">
                                    {isWarmup ? 'WARM-UP' : isCooldown ? 'COOL-DOWN' : `SET ${currentSet} OF ${exercise?.sets || 1}`}
                                </div>
                                <h1 className="exercise-name">{exercise?.name}</h1>
                                {exercise?.reps && (
                                    <div className="exercise-reps">{exercise.reps} {typeof exercise.reps === 'number' ? 'reps' : ''}</div>
                                )}
                                <p className="exercise-why">{exercise?.why}</p>

                                {/* Tired alternative */}
                                {exercise?.tiredAlt && !isWarmup && !isCooldown && (
                                    <button className="btn btn-ghost tired-alt-btn" onClick={() => useTiredAlt(exercise.id)}>
                                        😩 Too hard? Switch to easier alternative
                                    </button>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="workout-actions">
                                {!isWarmup && !isCooldown && (
                                    <button className="btn btn-secondary" onClick={() => swapExercise(exercise.id)}>
                                        🔄 Swap
                                    </button>
                                )}
                                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={nextAction}>
                                    {isWarmup ? 'Start Exercises →' : isCooldown ? 'Finish Workout ✓' : 'Done ✓'}
                                </button>
                            </div>

                            {/* Mid-workout state */}
                            {!isWarmup && !isCooldown && (
                                <div className="mid-state-bar">
                                    <button className={`mid-btn ${midState === 'strong' ? 'active' : ''}`} onClick={() => handleMidState('strong')}>💪 Strong</button>
                                    <button className={`mid-btn ${midState === 'break' ? 'active' : ''}`} onClick={() => handleMidState('break')}>⏸️ Need Break</button>
                                    <button className={`mid-btn stop ${midState === 'stop' ? 'active' : ''}`} onClick={() => handleMidState('stop')}>🛑 Stop</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        )
    }

    // === DEBRIEF ===
    if (phase === PHASES.DEBRIEF) {
        return (
            <div className="workout-page">
                <div className="workout-container">
                    <h2 className="step-title">How'd that go?</h2>
                    <p className="step-subtitle">Quick debrief — this feeds tomorrow's plan.</p>

                    <div className="debrief-item">
                        <label className="input-label">Energy Level</label>
                        <div className="debrief-scale">
                            {[1, 2, 3, 4, 5].map((v) => (
                                <button key={v} className={`mood-btn small ${debrief.energy === v ? 'selected' : ''}`} onClick={() => setDebrief({ ...debrief, energy: v })}>
                                    {['😫', '😕', '😐', '😊', '⚡'][v - 1]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="debrief-item">
                        <label className="input-label">Soreness</label>
                        <div className="debrief-scale">
                            {[1, 2, 3, 4, 5].map((v) => (
                                <button key={v} className={`mood-btn small ${debrief.soreness === v ? 'selected' : ''}`} onClick={() => setDebrief({ ...debrief, soreness: v })}>
                                    {['😌', '🙂', '😬', '😰', '🤕'][v - 1]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="debrief-item">
                        <label className="input-label">Mood After</label>
                        <div className="debrief-scale">
                            {[1, 2, 3, 4, 5].map((v) => (
                                <button key={v} className={`mood-btn small ${debrief.mood === v ? 'selected' : ''}`} onClick={() => setDebrief({ ...debrief, mood: v })}>
                                    {['😞', '😕', '😐', '😊', '🤩'][v - 1]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-6)' }} onClick={saveAndExit}>
                        Save & Finish ✓
                    </button>
                </div>
            </div>
        )
    }

    // === COMPLETE ===
    if (phase === PHASES.COMPLETE) {
        return (
            <div className="workout-page">
                <div className="workout-container" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🎉</div>
                    <h2 className="step-title">Workout Complete!</h2>
                    <p className="step-subtitle">
                        {exercisesCompleted} exercises logged. Your data feeds tomorrow's plan.
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard →
                    </button>
                </div>
            </div>
        )
    }

    return null
}
