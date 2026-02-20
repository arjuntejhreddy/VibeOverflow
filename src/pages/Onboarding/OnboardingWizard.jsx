import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import classifyArchetype from '../../utils/archetypes'

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

    function updateProfile(updates) {
        dispatch({ type: 'UPDATE_PROFILE', payload: updates })
    }

    function next() {
        if (currentStep < totalSteps - 1) {
            setDirection('forward')
            setCurrentStep((s) => s + 1)
        } else {
            // Last step — classify and reveal
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
                    {currentStep === totalSteps - 1 ? 'Reveal My Archetype ✦' : 'Continue →'}
                </button>
            </div>
        </div>
    )
}
