import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './context/UserContext'
import { useAuth } from './context/AuthContext'
import DashboardLayout from './components/DashboardLayout'
import OnboardingWizard from './pages/Onboarding/OnboardingWizard'
import Dashboard from './pages/Dashboard/Dashboard'
import WorkoutSession from './pages/Workout/WorkoutSession'
import PostureSession from './pages/Posture/PostureSession'
import NutritionPage from './pages/Nutrition/NutritionPage'
import ProgressPage from './pages/Progress/ProgressPage'
import WeeklyPlan from './pages/Plan/WeeklyPlan'
import TwinReveal from './pages/Twin/TwinReveal'
import TwinDashboard from './pages/Twin/TwinDashboard'
import AuthPage from './pages/Auth/AuthPage'

export default function App() {
    const { state } = useUser()
    const { isAuthenticated, loading } = useAuth()

    if (!state.loaded || loading) {
        return (
            <div className="app-loading">
                <div className="bg-gradient-mesh" />
                <div className="loading-pulse">
                    <span className="loading-logo">V</span>
                </div>
            </div>
        )
    }

    // Not logged in — show auth page
    if (!isAuthenticated) {
        return (
            <>
                <div className="bg-gradient-mesh" />
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </>
        )
    }

    return (
        <DashboardLayout>
            <Routes>
                <Route
                    path="/"
                    element={
                        state.onboardingComplete
                            ? <Navigate to="/dashboard" replace />
                            : <Navigate to="/onboarding" replace />
                    }
                />
                <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
                <Route path="/onboarding" element={<OnboardingWizard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/workout" element={<WorkoutSession />} />
                <Route path="/posture" element={<PostureSession />} />
                <Route path="/nutrition" element={<NutritionPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/plan" element={<WeeklyPlan />} />
                <Route path="/twin/reveal" element={<TwinReveal />} />
                <Route path="/twin" element={<TwinDashboard />} />
            </Routes>
        </DashboardLayout>
    )
}
