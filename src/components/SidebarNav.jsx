import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MithraFitLogo from './MithraFitLogo'
import './SidebarNav.css'

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/workout', label: 'Workout', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { path: '/plan', label: 'Plan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { path: '/posture', label: 'Form Check', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { path: '/nutrition', label: 'Nutrition', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { path: '/progress', label: 'Progress', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/twin/reveal', label: 'Twin', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
]

function NavIcon({ d, size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    )
}

export default function SidebarNav() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard'
        return location.pathname.startsWith(path)
    }

    return (
        <>
            {/* Desktop sidebar */}
            <nav className="sidebar" aria-label="Main navigation">
                <div className="sidebar-brand" onClick={() => navigate('/dashboard')} title="MithraFit">
                    <MithraFitLogo variant="mark" height={34} />
                </div>

                <div className="sidebar-nav-items">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.path}
                            className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                            title={item.label}
                            aria-label={item.label}
                            aria-current={isActive(item.path) ? 'page' : undefined}
                        >
                            <span className="sidebar-nav-icon">
                                <NavIcon d={item.icon} />
                            </span>
                            <span className="sidebar-nav-label">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="sidebar-footer">
                    {user?.picture && (
                        <img
                            src={user.picture}
                            alt={user.name || 'User'}
                            className="sidebar-avatar"
                            referrerPolicy="no-referrer"
                        />
                    )}
                    <button
                        className="sidebar-nav-item sidebar-logout"
                        onClick={logout}
                        title="Sign Out"
                        aria-label="Sign out"
                    >
                        <span className="sidebar-nav-icon">
                            <NavIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </span>
                        <span className="sidebar-nav-label">Sign Out</span>
                    </button>
                </div>
            </nav>

            {/* Mobile bottom tab bar */}
            <nav className="mobile-tabbar" aria-label="Mobile navigation">
                {NAV_ITEMS.slice(0, 5).map((item) => (
                    <button
                        key={item.path}
                        className={`tabbar-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                        aria-current={isActive(item.path) ? 'page' : undefined}
                    >
                        <span className="tabbar-icon"><NavIcon d={item.icon} size={18} /></span>
                        <span className="tabbar-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </>
    )
}
