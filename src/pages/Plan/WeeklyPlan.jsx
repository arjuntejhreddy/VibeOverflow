import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { generateWorkout, findSwap, getTiredAlternative } from '../../utils/exercises'
import './Plan.css'

export default function WeeklyPlan() {
    const navigate = useNavigate()
    const { state } = useUser()
    const { profile } = state

    const [weekPlan, setWeekPlan] = useState([])
    const [expandedIdx, setExpandedIdx] = useState(null)

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const REST_DAYS = [3, 6] // Thursday and Sunday are rest days (0-indexed)

    useEffect(() => {
        generateWeekPlan()
    }, [])

    function generateWeekPlan() {
        const plan = DAYS.map((day, i) => {
            if (REST_DAYS.includes(i)) {
                return { day, rest: true, exercises: [] }
            }
            const durations = [30, 35, 30, 30, 40, 35, 30]
            const workout = generateWorkout(profile, durations[i])
            return { day, rest: false, ...workout }
        })
        setWeekPlan(plan)
    }

    function swapExercise(dayIdx, exerciseIdx) {
        const updated = [...weekPlan]
        const ex = updated[dayIdx].exercises[exerciseIdx]
        const newEx = findSwap(ex.id, profile.injuries)
        if (newEx) {
            updated[dayIdx].exercises[exerciseIdx] = { ...newEx, sets: ex.sets, reps: ex.reps }
            setWeekPlan(updated)
        }
    }

    function useTiredAlt(dayIdx, exerciseIdx) {
        const updated = [...weekPlan]
        const ex = updated[dayIdx].exercises[exerciseIdx]
        const alt = getTiredAlternative(ex.id)
        if (alt) {
            updated[dayIdx].exercises[exerciseIdx] = { ...alt, sets: ex.sets, reps: ex.reps }
            setWeekPlan(updated)
        }
    }

    return (
        <div className="plan-page">
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ marginBottom: 'var(--space-4)' }}>
                ← Dashboard
            </button>
            <div className="plan-header">
                <div>
                    <h2 className="step-title">Weekly Plan</h2>
                    <p className="step-subtitle">Your personalized training week. Each exercise has 3 layers — what, why, and the easier option.</p>
                </div>
                <button className="btn btn-secondary" onClick={generateWeekPlan}>🔄 Regenerate</button>
            </div>

            <div className="plan-week stagger-children">
                {weekPlan.map((day, dayIdx) => (
                    <div key={dayIdx} className={`plan-day glass-card ${day.rest ? 'rest-day' : ''} ${expandedIdx === dayIdx ? 'expanded' : ''}`}>
                        <div
                            className="plan-day-header"
                            onClick={() => setExpandedIdx(expandedIdx === dayIdx ? null : dayIdx)}
                        >
                            <div className="plan-day-info">
                                <span className="plan-day-name">{day.day}</span>
                                {day.rest ? (
                                    <span className="plan-day-type rest">🧘 Rest & Recovery</span>
                                ) : (
                                    <span className="plan-day-type">{day.exercises?.length || 0} exercises</span>
                                )}
                            </div>
                            <span className="plan-day-toggle">{expandedIdx === dayIdx ? '−' : '+'}</span>
                        </div>

                        {expandedIdx === dayIdx && !day.rest && (
                            <div className="plan-day-content">
                                {/* Warmup */}
                                {day.warmup && (
                                    <div className="plan-exercise warmup">
                                        <div className="plan-exercise-badge">WARM-UP</div>
                                        <div className="plan-exercise-name">{day.warmup.name}</div>
                                        <p className="plan-exercise-why">{day.warmup.why}</p>
                                    </div>
                                )}

                                {/* Exercises */}
                                {day.exercises?.map((ex, exIdx) => (
                                    <div key={exIdx} className="plan-exercise">
                                        <div className="plan-exercise-header">
                                            <div>
                                                <div className="plan-exercise-name">{ex.name}</div>
                                                <div className="plan-exercise-detail">{ex.sets} sets × {ex.reps} {typeof ex.reps === 'number' ? 'reps' : ''}</div>
                                            </div>
                                            <div className="plan-exercise-actions">
                                                <button className="btn btn-ghost" title="Swap" onClick={() => swapExercise(dayIdx, exIdx)}>🔄</button>
                                                {ex.tiredAlt && (
                                                    <button className="btn btn-ghost" title="Easier version" onClick={() => useTiredAlt(dayIdx, exIdx)}>😩</button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Three layers */}
                                        <div className="plan-layers">
                                            <div className="plan-layer">
                                                <span className="plan-layer-label">What</span>
                                                <span>{ex.name} — {ex.sets}×{ex.reps} • {ex.equipment === 'none' ? 'No equipment' : ex.equipment}</span>
                                            </div>
                                            <div className="plan-layer">
                                                <span className="plan-layer-label">Why</span>
                                                <span>{ex.why}</span>
                                            </div>
                                            {ex.tiredAlt && (
                                                <div className="plan-layer tired">
                                                    <span className="plan-layer-label">Tired?</span>
                                                    <span>Switch to {getTiredAlternative(ex.id)?.name || 'easier version'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Cooldown */}
                                {day.cooldown && (
                                    <div className="plan-exercise cooldown">
                                        <div className="plan-exercise-badge">COOL-DOWN</div>
                                        <div className="plan-exercise-name">{day.cooldown.name}</div>
                                        <p className="plan-exercise-why">{day.cooldown.why}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {expandedIdx === dayIdx && day.rest && (
                            <div className="plan-day-content rest-content">
                                <p>Recovery is where growth happens. Today focus on:</p>
                                <ul className="rest-list">
                                    <li>🧘 Light stretching or yoga</li>
                                    <li>🚶 20-minute walk</li>
                                    <li>💧 Extra hydration</li>
                                    <li>😴 Quality sleep</li>
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
