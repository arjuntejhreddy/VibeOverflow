import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { getUserProfile, saveUserProfile } from '../db'

const UserContext = createContext()

const initialState = {
    loaded: false,
    onboardingComplete: false,
    profile: {
        // Path
        path: null, // 'athlete' | 'lifestyle'
        // Sport / Goal
        sport: '',
        goal: '',
        // Fitness Level
        fitnessLevel: 'beginner', // beginner | intermediate | advanced
        // Body Metrics
        age: '',
        gender: '',
        height: '',
        weight: '',
        // Lifestyle
        jobType: 'sedentary', // sedentary | active | mixed
        workHours: 8,
        sleepHours: 7,
        stressLevel: 3,
        // Budget
        fitnessBudget: 50,
        nutritionBudget: 50,
        // Injuries
        injuries: [],
        // Quit Reason
        quitReason: '',
        quitReasonChips: [],
        // Cuisine
        cuisine: '',
        cuisineSubOptions: [],
        // Fitness Test
        pushups: 0,
        plankSeconds: 0,
        squats: 0,
        // Weak Zones
        weakZones: [],
        // Competition (athlete only)
        competitionDate: '',
        // Coaching Persona
        coachPersona: 'hype', // drill | friend | zen | hype
        // Archetype
        archetype: null,
    },
}

function userReducer(state, action) {
    switch (action.type) {
        case 'LOAD_PROFILE':
            return {
                ...state,
                loaded: true,
                onboardingComplete: action.payload?.onboardingComplete || false,
                profile: { ...state.profile, ...action.payload?.profile },
            }
        case 'UPDATE_PROFILE':
            return {
                ...state,
                profile: { ...state.profile, ...action.payload },
            }
        case 'COMPLETE_ONBOARDING':
            return {
                ...state,
                onboardingComplete: true,
                profile: { ...state.profile, archetype: action.payload },
            }
        case 'RESET':
            return { ...initialState, loaded: true }
        default:
            return state
    }
}

export function UserProvider({ children }) {
    const [state, dispatch] = useReducer(userReducer, initialState)

    // Load from IndexedDB on mount
    useEffect(() => {
        getUserProfile().then((data) => {
            dispatch({ type: 'LOAD_PROFILE', payload: data || {} })
        })
    }, [])

    // Persist to IndexedDB on profile changes
    useEffect(() => {
        if (state.loaded) {
            saveUserProfile({
                onboardingComplete: state.onboardingComplete,
                profile: state.profile,
            })
        }
    }, [state.profile, state.onboardingComplete, state.loaded])

    return (
        <UserContext.Provider value={{ state, dispatch }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const ctx = useContext(UserContext)
    if (!ctx) throw new Error('useUser must be used within a UserProvider')
    return ctx
}
