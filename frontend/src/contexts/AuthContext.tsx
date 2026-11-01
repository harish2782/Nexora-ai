import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User { id: string; email: string; name: string }
interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string, user: User) => void
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try { return JSON.parse(localStorage.getItem('nexora_user') || 'null') }
        catch { return null }
    })
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexora_token'))

    function login(t: string, u: User) {
        setToken(t)
        setUser(u)
        localStorage.setItem('nexora_token', t)
        localStorage.setItem('nexora_user', JSON.stringify(u))
    }

    function logout() {
        setToken(null)
        setUser(null)
        localStorage.removeItem('nexora_token')
        localStorage.removeItem('nexora_user')
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
