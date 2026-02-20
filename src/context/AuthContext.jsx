import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { googleLogout } from '@react-oauth/google'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load stored user on mount
    useEffect(() => {
        const stored = localStorage.getItem('googleUser')
        if (stored) {
            try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
        }
        setLoading(false)
    }, [])

    // Called after Google returns the credential JWT
    const handleLogin = useCallback((credentialResponse) => {
        // Decode the JWT to get user info
        const token = credentialResponse.credential
        const payload = JSON.parse(atob(token.split('.')[1]))
        const profile = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            givenName: payload.given_name,
            familyName: payload.family_name,
            sub: payload.sub, // Google user ID
        }
        setUser(profile)
        localStorage.setItem('googleUser', JSON.stringify(profile))
    }, [])

    const handleLogout = useCallback(() => {
        googleLogout()
        setUser(null)
        localStorage.removeItem('googleUser')
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            login: handleLogin,
            logout: handleLogout,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
