import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import classifyArchetype from '../../utils/archetypes'
import { HERO_IMAGES } from '../../utils/images'

// Steps
import StepPathSelect from './steps/StepPathSelect'
import StepSportGoal from './steps/StepSportGoal'
import StepFitnessLevel from './steps/StepFitnessLevel'
import StepBodyMetrics from './steps/StepBodyMetrics'
import StepLifestyle from './steps/StepLifestyle'
import StepSleepStress from './steps/StepSleepStress'
import StepBudget from './steps/StepBudget'
import StepInjuries from './steps/StepInjuries'
import StepQuitReason from './steps/StepQuitReason'
import StepCuisine from './steps/StepCuisine'
import StepFitnessTest from './steps/StepFitnessTest'
import StepWeakZones from './steps/StepWeakZones'
import StepCompetition from './steps/StepCompetition'
import StepCoachPersona from './steps/StepCoachPersona'
import ArchetypeReveal from './ArchetypeReveal'

import './Onboarding.css'

const STEP_QUOTES = [
    "Every expert was once a beginner.",
    "Your body can do it. It's your mind you have to convince.",
    "The only bad workout is the one that didn't happen.",
    "Success is the sum of small efforts, repeated.",
    "Push yourself, because no one else will do it for you.",
    "Train insane or remain the same.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Don't wish for it. Work for it.",
    "It never gets easier. You just get stronger.",
    "Be stronger than your excuses.",
    "Sweat is just fat crying.",
    "No pain, no gain.",
    "Wake up. Work out. Kick ass. Repeat.",
    "Your future self is watching. Make them proud.",
]

export default function OnboardingWizard() {
    const { state, dispatch } = useUser()
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState('forward')
    const [showReveal, setShowReveal] = useState(false)

    const isAthlete = state.profile.path === 'athlete'

    // Build step list dynamically based on path
    const steps = [
        { id: 'path', component: StepPathSelect, label: 'Your Path' },
        { id: 'sport-goal', component: StepSportGoal, label: 'Sport & Goal' },
        { id: 'fitness-level', component: StepFitnessLevel, label: 'Fitness Level' },
        { id: 'body-metrics', component: StepBodyMetrics, label: 'Body Metrics' },
        { id: 'lifestyle', component: StepLifestyle, label: 'Lifestyle' },
        { id: 'sleep-stress', component: StepSleepStress, label: 'Sleep & Stress' },
        { id: 'budget', component: StepBudget, label: 'Budget' },
        { id: 'injuries', component: StepInjuries, label: 'Injuries' },
        { id: 'quit-reason', component: StepQuitReason, label: 'Past Experience' },
        { id: 'cuisine', component: StepCuisine, label: 'Cuisine' },
        { id: 'fitness-test', component: StepFitnessTest, label: 'Fitness Test' },
        { id: 'weak-zones', component: StepWeakZones, label: 'Weak Zones' },
        ...(isAthlete ? [{ id: 'competition', component: StepCompetition, label: 'Competition' }] : []),
        { id: 'coach-persona', component: StepCoachPersona, label: 'Your Coach' },
    ]

    const totalSteps = steps.length
    const progress = ((currentStep + 1) / totalSteps) * 100
    const quote = STEP_QUOTES[currentStep % STEP_QUOTES.length]

    function updateProfile(updates) {
        dispatch({ type: 'UPDATE_PROFILE', payload: updates })
    }

    function next() {
        if (currentStep < totalSteps - 1) {
            setDirection('forward')
            setCurrentStep((s) => s + 1)
        } else {
            const archetype = classifyArchetype(state.profile)
            setShowReveal(true)
            dispatch({ type: 'COMPLETE_ONBOARDING', payload: archetype })
        }
    }

    function back() {
        if (currentStep > 0) {
            setDirection('back')
            setCurrentStep((s) => s - 1)
        }
    }

    function handleRevealContinue() {
        navigate('/dashboard')
    }

    if (showReveal) {
        return <ArchetypeReveal archetype={state.profile.archetype} onContinue={handleRevealContinue} />
    }

    const CurrentStepComponent = steps[currentStep].component

    return (
        <div className="onboarding-split">
            {/* Left — image panel (desktop only) */}
            <div className="onboarding-image-panel">
                <img
                    src={HERO_IMAGES.onboarding}
                    alt="Person working out"
                    className="onboarding-img"
                />
                <div className="onboarding-img-overlay">
                    <div className="onboarding-img-content">
                        <div className="onboarding-img-brand">VibeOverflow</div>
                        <p className="onboarding-img-quote">"{quote}"</p>
                        <div className="onboarding-img-progress">
                            <div
                                className="onboarding-img-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="onboarding-img-step-count">
                            Step {currentStep + 1} of {totalSteps}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right — form */}
            <div className="onboarding">
                {/* Progress bar */}
                <div className="onboarding-progress">
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="onboarding-progress-info">
                        <span className="onboarding-step-label">{steps[currentStep].label}</span>
                        <span className="onboarding-step-count">{currentStep + 1} / {totalSteps}</span>
                    </div>
                </div>

                {/* Step content */}
                <div className="onboarding-content" key={currentStep}>
                    <div className={`onboarding-step-wrapper ${direction === 'forward' ? 'animate-slide-right' : 'animate-slide-left'}`}>
                        <CurrentStepComponent
                            profile={state.profile}
                            updateProfile={updateProfile}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className="onboarding-nav">
                    <button
                        className="btn btn-ghost"
                        onClick={back}
                        disabled={currentStep === 0}
                    >
                        ← Back
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={next}>
                        {currentStep === totalSteps - 1 ? 'Reveal My Archetype' : 'Continue →'}
                    </button>
                </div>
            </div>
        </div>
    )
}
