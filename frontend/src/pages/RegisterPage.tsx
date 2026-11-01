import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { User, Lock, Mail, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.')
            return
        }

        setLoading(true)
        try {
            const res = await api.post('/auth/register', { name, email, password })
            login(res.data.token, res.data.user)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.details?.formErrors?.[0] || 'Registration failed. Try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-navy-900 text-gray-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan/15 blur-[120px] rounded-full pointer-events-none" />

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
                <p className="text-sm text-gray-400 mt-2">Create your account to start mapping your career gap</p>
            </div>

            {/* Card */}
            <div className="w-full max-w-md bg-navy-800/90 border border-navy-600 rounded-2xl p-8 shadow-2xl backdrop-blur relative z-10">
                {error && (
                    <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Full Name</label>
                        <div className="relative">
                            <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Alex Morgan"
                                className="input pl-11"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">Email Address</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="alex@example.com"
                                className="input pl-11"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">Password (Min. 8 characters)</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input pl-11"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-violet/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Free Account</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 pt-5 border-t border-navy-600/70 space-y-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Instant access to 10 predefined industry role targets</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Interactive 80+ node skill prerequisite graph</span>
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-violet-light hover:text-white font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
