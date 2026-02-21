import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import SidebarNav from './SidebarNav'
import MithraFitLogo from './MithraFitLogo'
import './DashboardLayout.css'

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth()
    const { dispatch } = useUser()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    // Close menu on outside click
    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    function handleRedoOnboarding() {
        dispatch({ type: 'RESET' })
        navigate('/onboarding')
        setMenuOpen(false)
    }

    function handleLogout() {
        logout()
        setMenuOpen(false)
    }

    return (
        <div className="app-layout">
            <SidebarNav />
            <div className="app-main">
                <header className="app-header">
                    <div className="header-left">
                        <p className="header-greeting">{getGreeting()},</p>
                        <h1 className="header-name">{user?.givenName || user?.name || 'Athlete'}</h1>
                    </div>

                    {/* ── Centred brand wordmark ── */}
                    <div className="header-brand">
                        <MithraFitLogo variant="full" height={32} />
                    </div>
                    <div className="header-right">
                        {/* Notification bell */}
                        <button className="header-icon-btn" aria-label="Notifications">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* User avatar + dropdown menu */}
                        {user?.picture && (
                            <div className="header-avatar-menu" ref={menuRef}>
                                <button
                                    className="header-avatar-btn"
                                    onClick={() => setMenuOpen((o) => !o)}
                                    aria-label="Account menu"
                                    aria-expanded={menuOpen}
                                >
                                    <img
                                        src={user.picture}
                                        alt={user.name || 'User'}
                                        className="header-avatar"
                                        referrerPolicy="no-referrer"
                                    />
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="header-avatar-chevron">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                {menuOpen && (
                                    <div className="header-dropdown">
                                        <div className="header-dropdown-user">
                                            <img src={user.picture} alt={user.name} className="dropdown-avatar" referrerPolicy="no-referrer" />
                                            <div>
                                                <div className="dropdown-name">{user.name}</div>
                                                <div className="dropdown-email">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="header-dropdown-divider" />
                                        <button className="header-dropdown-item" onClick={handleRedoOnboarding}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Redo Onboarding
                                        </button>
                                        <button className="header-dropdown-item danger" onClick={handleLogout}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>
                <main className="app-content">
                    {children}
                </main>
            </div>
        </div>
    )
}
