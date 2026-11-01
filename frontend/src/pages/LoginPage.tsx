import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await api.post('/auth/login', { email, password })
            login(res.data.token, res.data.user)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid email or password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDemoLogin = async () => {
        setError(null)
        setLoading(true)
        const demoEmail = 'demo@nexora.ai'
        const demoPassword = 'Password123!'

        try {
            // Try logging in with demo account
            const res = await api.post('/auth/login', { email: demoEmail, password: demoPassword })
            login(res.data.token, res.data.user)
            navigate('/dashboard')
        } catch {
            // If demo account doesn't exist yet, register it automatically
            try {
                const regRes = await api.post('/auth/register', {
                    name: 'Alex Developer',
                    email: demoEmail,
                    password: demoPassword,
                })
                login(regRes.data.token, regRes.data.user)
                navigate('/dashboard')
            } catch (regErr: any) {
                // If backend isn't connected to postgres yet, create a local guest session
                const dummyUser = { id: 'demo-user-123', name: 'Alex Developer', email: demoEmail }
                login('demo-jwt-token-guest-access', dummyUser)
                navigate('/dashboard')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-navy-900 text-gray-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet/15 blur-[120px] rounded-full pointer-events-none" />

            {/* Logo */}
            <div className="mb-8 text-center">
                <Link to="/" className="inline-flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-black border-2 border-orange-500 flex items-center justify-center font-black text-orange-400 text-2xl shadow-xl shadow-orange-500/30">
                        N
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-white">
                        Nexora <span className="text-orange-400">AI</span>
                    </span>
                </Link>
                <p className="text-sm text-gray-400 mt-2">Sign in to your Career Intelligence workspace</p>
            </div>

            {/* Card */}
            <div className="w-full max-w-md bg-navy-800/90 border border-navy-600 rounded-2xl p-8 shadow-2xl backdrop-blur relative z-10">
                {error && (
                    <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="label">Work Email</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="input pl-11"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="label mb-0">Password</label>
                        </div>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input pl-11"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-violet/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-navy-600/70" />
                    </div>
                    <span className="relative bg-navy-800 px-3 text-xs text-gray-500 uppercase tracking-wider">
                        Or instant access
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-navy-700 hover:bg-navy-600 border border-navy-500 text-sm font-medium text-gray-200 flex items-center justify-center gap-2 transition-colors"
                >
                    <Sparkles className="w-4 h-4 text-cyan-light" />
                    <span>Explore with Demo Sandbox Account</span>
                </button>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-violet-light hover:text-white font-medium">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    )
}
