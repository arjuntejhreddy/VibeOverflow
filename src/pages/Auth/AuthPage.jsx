import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import { HERO_IMAGES } from '../../utils/images'
import './Auth.css'

export default function AuthPage() {
    const navigate = useNavigate()
    const { login, isAuthenticated, user } = useAuth()

    function handleSuccess(credentialResponse) {
        login(credentialResponse)
        navigate('/dashboard')
    }

    // Already logged in — show profile + continue
    if (isAuthenticated && user) {
        return (
            <div className="auth-page">
                <div className="bg-gradient-mesh" />
                <div className="auth-split">
                    <div className="auth-hero">
                        <img src={HERO_IMAGES.workout} alt="Fitness" className="auth-hero-img" />
                        <div className="auth-hero-overlay">
                            <div className="auth-hero-content">
                                <h1 className="auth-hero-title">VIBE<br />OVERFLOW</h1>
                                <p className="auth-hero-subtitle">Your AI-powered fitness companion.</p>
                            </div>
                        </div>
                    </div>
                    <div className="auth-form-side">
                        <div className="auth-form-container" style={{ textAlign: 'center' }}>
                            <img src={user.picture} alt={user.name} className="auth-avatar" />
                            <h2 className="step-title" style={{ marginTop: 'var(--space-4)' }}>Welcome back,</h2>
                            <p className="auth-user-name">{user.name}</p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>{user.email}</p>
                            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/dashboard')}>
                                Continue to Dashboard →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="bg-gradient-mesh" />
            <div className="auth-split">
                {/* Left — Hero */}
                <div className="auth-hero">
                    <img src={HERO_IMAGES.workout} alt="Fitness" className="auth-hero-img" />
                    <div className="auth-hero-overlay">
                        <div className="auth-hero-content">
                            <h1 className="auth-hero-title">VIBE<br />OVERFLOW</h1>
                            <p className="auth-hero-subtitle">Your AI-powered fitness companion. Train smarter, eat better, grow stronger.</p>
                        </div>
                    </div>
                </div>

                {/* Right — Google Sign In */}
                <div className="auth-form-side">
                    <div className="auth-form-container" style={{ textAlign: 'center' }}>
                        <div className="auth-logo-pill">
                            <span className="auth-logo-icon">✦</span>
                            <span>VibeOverflow</span>
                        </div>
                        <h2 className="step-title" style={{ marginTop: 'var(--space-6)' }}>Sign in to continue</h2>
                        <p className="step-subtitle" style={{ marginBottom: 'var(--space-8)' }}>
                            Use your Google account to get started.<br />No passwords needed.
                        </p>

                        <div className="auth-google-btn-wrapper">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={() => console.error('Google login failed')}
                                theme="filled_black"
                                size="large"
                                shape="pill"
                                text="signin_with"
                                width="320"
                            />
                        </div>

                        <p className="auth-disclaimer">
                            By signing in, you agree to use this app at your own risk.<br />
                            We only store your name, email, and profile picture locally.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
