import React from 'react'
import { useAuth } from '../context/AuthContext'
import SidebarNav from './SidebarNav'
import './DashboardLayout.css'

export default function DashboardLayout({ children }) {
    const { user } = useAuth()

    const greeting = getGreeting()

    function getGreeting() {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 17) return 'Good afternoon'
        return 'Good evening'
    }

    return (
        <div className="app-layout">
            <SidebarNav />
            <div className="app-main">
                <header className="app-header">
                    <div className="header-left">
                        <p className="header-greeting">{greeting},</p>
                        <h1 className="header-name">{user?.givenName || user?.name || 'Athlete'}</h1>
                    </div>
                    <div className="header-right">
                        <button className="header-icon-btn" aria-label="Notifications">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        {user?.picture && (
                            <img
                                src={user.picture}
                                alt={user.name || 'User'}
                                className="header-avatar"
                                referrerPolicy="no-referrer"
                            />
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
