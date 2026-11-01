import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import {
    FileText,
    Compass,
    Network,
    Map,
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Sparkles,
    Plus,
    Layers,
} from 'lucide-react'

interface Analysis {
    id: string
    role_title?: string
    role_profile_id?: string
    submitted_job_text?: string
    analysis_status: string
    created_at: string
}

export default function DashboardPage() {
    const { user } = useAuth()
    const [analyses, setAnalyses] = useState<Analysis[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnalyses = async () => {
            try {
                const res = await api.get('/analyses')
                setAnalyses(res.data)
            } catch {
                // If offline or empty, provide friendly fallback
                setAnalyses([])
            } finally {
                setLoading(false)
            }
        }
        fetchAnalyses()
    }, [])

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-800 via-navy-800 to-violet/10 border border-navy-600">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                        Welcome back, {user?.name || 'Engineer'}!
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Track your career readiness, analyze skill gaps against market roles, and execute your custom roadmaps.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/resume"
                        className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-violet/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Upload Resume</span>
                    </Link>
                    <Link
                        to="/roles"
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        <Compass className="w-4 h-4 text-cyan-light" />
                        <span>Explore Roles</span>
                    </Link>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 border border-navy-600 bg-navy-800/80">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Analyses</span>
                        <div className="p-2 rounded-lg bg-violet/10 text-violet-light">
                            <Layers className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-bold text-white">{analyses.length}</span>
                        <span className="text-xs text-gray-400 ml-2">gap assessments</span>
                    </div>
                </div>

                <div className="card p-5 border border-navy-600 bg-navy-800/80">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Target</span>
                        <div className="p-2 rounded-lg bg-cyan/10 text-cyan-light">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-lg font-bold text-white truncate block">
                            {analyses[0]?.role_title || 'Full Stack Engineer'}
                        </span>
                        <span className="text-xs text-emerald-400">Primary focus</span>
                    </div>
                </div>

                <div className="card p-5 border border-navy-600 bg-navy-800/80">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skill Taxonomies</span>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Network className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-bold text-white">80+</span>
                        <span className="text-xs text-gray-400 ml-2">curated skills</span>
                    </div>
                </div>

                <div className="card p-5 border border-navy-600 bg-navy-800/80">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Curated Projects</span>
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-bold text-white">30</span>
                        <span className="text-xs text-gray-400 ml-2">portfolio blueprints</span>
                    </div>
                </div>
            </div>

            {/* Quick Action Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/resume"
                    className="card-hover p-6 rounded-2xl bg-navy-800 border border-navy-600 flex flex-col justify-between group"
                >
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-violet/10 text-violet-light flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-violet-light transition-colors">
                            Resume Intelligence
                        </h3>
                        <p className="text-sm text-gray-400">
                            Upload your PDF resume to extract and verify canonical technical skills and past project evidence.
                        </p>
                    </div>
                    <div className="mt-6 flex items-center text-sm text-violet-light font-medium gap-1">
                        <span>Review parsed resume</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link
                    to="/graph"
                    className="card-hover p-6 rounded-2xl bg-navy-800 border border-navy-600 flex flex-col justify-between group"
                >
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan/10 text-cyan-light flex items-center justify-center">
                            <Network className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-light transition-colors">
                            Skill Knowledge Graph
                        </h3>
                        <p className="text-sm text-gray-400">
                            Visualize prerequisites across frontend, backend, databases, and DevOps in an interactive node canvas.
                        </p>
                    </div>
                    <div className="mt-6 flex items-center text-sm text-cyan-light font-medium gap-1">
                        <span>Open interactive graph</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link
                    to="/projects"
                    className="card-hover p-6 rounded-2xl bg-navy-800 border border-navy-600 flex flex-col justify-between group"
                >
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                            Project Studio
                        </h3>
                        <p className="text-sm text-gray-400">
                            Browse real-world engineering project templates mapped specifically to bridge your identified missing skills.
                        </p>
                    </div>
                    <div className="mt-6 flex items-center text-sm text-emerald-400 font-medium gap-1">
                        <span>Explore project blueprints</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* Recent Analyses Section */}
            <div className="card p-6 border border-navy-600 bg-navy-800/90 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Recent Skill Gap Analyses</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Your recent role comparisons and matching histories</p>
                    </div>
                    <Link to="/roles" className="btn-secondary text-xs flex items-center gap-1.5 py-2">
                        <Plus className="w-3.5 h-3.5" />
                        <span>New Analysis</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-3 py-6">
                        <div className="skeleton h-12 w-full" />
                        <div className="skeleton h-12 w-full" />
                        <div className="skeleton h-12 w-full" />
                    </div>
                ) : analyses.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-navy-600 rounded-xl bg-navy-900/50">
                        <div className="w-12 h-12 rounded-2xl bg-violet/10 text-violet-light flex items-center justify-center mx-auto mb-3">
                            <Compass className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-semibold text-white">No analyses generated yet</h3>
                        <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1 mb-5">
                            Upload a resume and select a target industry role or paste a job description to see your first skill gap breakdown.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Link to="/resume" className="btn-primary text-xs flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                <span>Upload Resume First</span>
                            </Link>
                            <Link to="/roles" className="btn-secondary text-xs flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5" />
                                <span>Select Target Role</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-navy-600 text-xs text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">Role Target</th>
                                    <th className="py-3 px-4">Created Date</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-600/60">
                                {analyses.map((a) => (
                                    <tr key={a.id} className="hover:bg-navy-700/40 transition-colors">
                                        <td className="py-3.5 px-4 font-medium text-white">
                                            {a.role_title || 'Custom Job Description'}
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-400">
                                            {new Date(a.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {a.analysis_status === 'completed' ? (
                                                <span className="badge-matched text-xs">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Ready
                                                </span>
                                            ) : a.analysis_status === 'processing' ? (
                                                <span className="badge-uncertain text-xs">
                                                    <Clock className="w-3 h-3 animate-spin" />
                                                    Analyzing
                                                </span>
                                            ) : (
                                                <span className="badge-missing text-xs">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right space-x-2">
                                            <Link
                                                to={`/analysis/${a.id}`}
                                                className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                                            >
                                                <span>View Gap</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                            <Link
                                                to={`/roadmap/${a.id}`}
                                                className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                                            >
                                                <Map className="w-3 h-3" />
                                                <span>Roadmap</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
