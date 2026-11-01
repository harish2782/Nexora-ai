import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '@/lib/api'
import {
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    ArrowRight,
    Map,
    FolderGit2,
    Network,
    Quote,
    Filter,
    ShieldAlert,
    Sparkles,
    Loader2,
} from 'lucide-react'

interface EvidenceItem {
    skill: string
    importance?: string
    status: 'matched' | 'missing' | 'uncertain'
    confidence: number
    evidence?: string | null
    evidence_text?: string | null
    evidence_type?: string
}

export default function AnalysisPage() {
    const { id } = useParams<{ id: string }>()
    const [loading, setLoading] = useState(true)
    const [roleTitle, setRoleTitle] = useState('Target Role Analysis')
    const [items, setItems] = useState<EvidenceItem[]>([])
    const [filter, setFilter] = useState<'all' | 'matched' | 'missing' | 'uncertain'>('all')

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true)
            try {
                const res = await api.get(`/analyses/${id}`)
                if (res.data) {
                    setRoleTitle(res.data.role_title || 'Target Role Analysis')
                    const evidenceList: EvidenceItem[] = (res.data.evidence || []).map((e: any) => ({
                        skill: e.skill_name || e.skill,
                        importance: e.importance || 'required',
                        status: e.match_status || e.status,
                        confidence: e.confidence ?? 0.8,
                        evidence: e.evidence_text || e.evidence,
                        evidence_type: e.evidence_type,
                    }))
                    setItems(evidenceList)
                }
            } catch {
                // Check localStorage for offline / mock analysis
                const cached = localStorage.getItem(`nexora_analysis_${id}`)
                if (cached) {
                    try {
                        const parsed = JSON.parse(cached)
                        setRoleTitle(parsed.role_title || 'Full Stack Engineer')
                        const combined: EvidenceItem[] = [
                            ...(parsed.matched || []),
                            ...(parsed.uncertain || []),
                            ...(parsed.missing || []),
                        ]
                        setItems(combined)
                    } catch {
                        // ignore
                    }
                } else {
                    // Default representative dataset
                    setRoleTitle('Full Stack Engineer Analysis')
                    setItems([
                        {
                            skill: 'React',
                            importance: 'required',
                            status: 'matched',
                            confidence: 0.95,
                            evidence: 'Demonstrated 3+ years experience engineering responsive SPAs and design systems with React.',
                            evidence_type: 'exact',
                        },
                        {
                            skill: 'JavaScript',
                            importance: 'required',
                            status: 'matched',
                            confidence: 0.98,
                            evidence: 'Core language proficiency verified across multiple web development positions.',
                            evidence_type: 'exact',
                        },
                        {
                            skill: 'Git',
                            importance: 'required',
                            status: 'matched',
                            confidence: 0.92,
                            evidence: 'Version control usage indicated in team collaboration and open source work.',
                            evidence_type: 'exact',
                        },
                        {
                            skill: 'REST API',
                            importance: 'required',
                            status: 'matched',
                            confidence: 0.88,
                            evidence: 'Designed and consumed microservice endpoints and RESTful web services.',
                            evidence_type: 'exact',
                        },
                        {
                            skill: 'TypeScript',
                            importance: 'preferred',
                            status: 'uncertain',
                            confidence: 0.52,
                            evidence: 'Mentioned in skills summary list, but limited project implementation details in resume work history.',
                            evidence_type: 'semantic',
                        },
                        {
                            skill: 'Docker',
                            importance: 'preferred',
                            status: 'uncertain',
                            confidence: 0.45,
                            evidence: 'Listed container concepts in tools, but no production orchestration or Dockerfile authoring mentioned.',
                            evidence_type: 'semantic',
                        },
                        {
                            skill: 'PostgreSQL',
                            importance: 'required',
                            status: 'missing',
                            confidence: 0.08,
                            evidence: null,
                            evidence_type: 'none',
                        },
                        {
                            skill: 'CI/CD',
                            importance: 'preferred',
                            status: 'missing',
                            confidence: 0.05,
                            evidence: null,
                            evidence_type: 'none',
                        },
                    ])
                }
            } finally {
                setLoading(false)
            }
        }

        fetchAnalysis()
    }, [id])

    const matched = items.filter((i) => i.status === 'matched')
    const missing = items.filter((i) => i.status === 'missing')
    const uncertain = items.filter((i) => i.status === 'uncertain')

    const totalCount = items.length || 1
    const matchPercentage = Math.round((matched.length / totalCount) * 100)

    const filteredItems = items.filter((item) => {
        if (filter === 'all') return true
        return item.status === filter
    })

    const handleToggleStatus = (skillName: string, newStatus: 'matched' | 'missing' | 'uncertain') => {
        setItems((prev) =>
            prev.map((i) => (i.skill === skillName ? { ...i, status: newStatus } : i))
        )
    }

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-violet-light animate-spin" />
                <p className="text-sm text-gray-400">Loading skill gap assessment and evidence...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-navy-800/90 border border-navy-600">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-light mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-light" />
                        <span>Semantic Gap Report</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{roleTitle}</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Detailed match verification comparing your resume against required role competencies.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to={`/roadmap/${id}`}
                        className="btn-primary py-2.5 px-5 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-violet/20"
                    >
                        <Map className="w-4 h-4" />
                        <span>View Roadmap</span>
                    </Link>
                    <Link
                        to="/projects"
                        className="btn-secondary py-2.5 px-4 text-sm font-medium flex items-center gap-1.5"
                    >
                        <FolderGit2 className="w-4 h-4 text-emerald-400" />
                        <span>Recommended Projects</span>
                    </Link>
                </div>
            </div>

            {/* Score & Summary Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Score Card */}
                <div className="card p-6 bg-navy-800 border border-navy-600 rounded-2xl flex items-center gap-5 md:col-span-1">
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-navy-700"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className={
                                    matchPercentage >= 70
                                        ? 'text-emerald-400'
                                        : matchPercentage >= 40
                                        ? 'text-amber-400'
                                        : 'text-red-400'
                                }
                                strokeDasharray={`${matchPercentage}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-extrabold text-xl text-white">
                            {matchPercentage}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overall Match</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                            {matchPercentage >= 70
                                ? 'Strong Match'
                                : matchPercentage >= 40
                                ? 'Moderate Match'
                                : 'Gap Remediation Needed'}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1">
                            {matched.length} of {items.length} skills verified
                        </div>
                    </div>
                </div>

                {/* Matched Count */}
                <div
                    onClick={() => setFilter('matched')}
                    className={`card p-5 border cursor-pointer transition-all rounded-2xl ${
                        filter === 'matched' ? 'border-emerald-500 bg-emerald-500/10' : 'border-navy-600 bg-navy-800'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Matched Skills</span>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-2">{matched.length}</div>
                    <div className="text-xs text-gray-400 mt-1">Confirmed with evidence</div>
                </div>

                {/* Uncertain Count */}
                <div
                    onClick={() => setFilter('uncertain')}
                    className={`card p-5 border cursor-pointer transition-all rounded-2xl ${
                        filter === 'uncertain' ? 'border-amber-500 bg-amber-500/10' : 'border-navy-600 bg-navy-800'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Uncertain</span>
                        <HelpCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-2">{uncertain.length}</div>
                    <div className="text-xs text-gray-400 mt-1">Partial or keyword mention</div>
                </div>

                {/* Missing Count */}
                <div
                    onClick={() => setFilter('missing')}
                    className={`card p-5 border cursor-pointer transition-all rounded-2xl ${
                        filter === 'missing' ? 'border-red-500 bg-red-500/10' : 'border-navy-600 bg-navy-800'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Skill Gaps</span>
                        <ShieldAlert className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-2">{missing.length}</div>
                    <div className="text-xs text-gray-400 mt-1">Prioritized in roadmap</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between border-b border-navy-600 pb-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            filter === 'all' ? 'bg-navy-700 text-white border border-navy-500' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        All Competencies ({items.length})
                    </button>
                    <button
                        onClick={() => setFilter('matched')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            filter === 'matched' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Matched ({matched.length})
                    </button>
                    <button
                        onClick={() => setFilter('uncertain')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            filter === 'uncertain' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Uncertain ({uncertain.length})
                    </button>
                    <button
                        onClick={() => setFilter('missing')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            filter === 'missing' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Missing Gaps ({missing.length})
                    </button>
                </div>

                <Link to="/graph" className="text-xs text-violet-light hover:text-white flex items-center gap-1 font-medium">
                    <Network className="w-3.5 h-3.5" />
                    <span>View in Knowledge Graph</span>
                </Link>
            </div>

            {/* Detailed Skills Evidence List */}
            <div className="space-y-4">
                {filteredItems.map((item) => (
                    <div
                        key={item.skill}
                        className="card p-5 bg-navy-800/90 border border-navy-600 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-navy-500 transition-all"
                    >
                        <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h3 className="text-base font-bold text-white">{item.skill}</h3>
                                {item.status === 'matched' && (
                                    <span className="badge-matched text-xs">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Matched ({Math.round(item.confidence * 100)}%)
                                    </span>
                                )}
                                {item.status === 'uncertain' && (
                                    <span className="badge-uncertain text-xs">
                                        <HelpCircle className="w-3 h-3" />
                                        Uncertain ({Math.round(item.confidence * 100)}%)
                                    </span>
                                )}
                                {item.status === 'missing' && (
                                    <span className="badge-missing text-xs">
                                        <ShieldAlert className="w-3 h-3" />
                                        Missing Gap
                                    </span>
                                )}
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-navy-700 text-gray-300 border border-navy-600 uppercase">
                                    {item.importance || 'required'}
                                </span>
                            </div>

                            {/* Confidence Progress Bar */}
                            <div className="w-full max-w-xs bg-navy-950 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${
                                        item.status === 'matched'
                                            ? 'bg-emerald-400'
                                            : item.status === 'uncertain'
                                            ? 'bg-amber-400'
                                            : 'bg-red-400'
                                    }`}
                                    style={{ width: `${Math.max(item.confidence * 100, 6)}%` }}
                                />
                            </div>

                            {/* Evidence Snippet */}
                            {item.evidence ? (
                                <div className="p-3 rounded-xl bg-navy-950 border border-navy-700/80 text-xs text-gray-300 flex items-start gap-2.5">
                                    <Quote className="w-3.5 h-3.5 text-violet-light shrink-0 mt-0.5" />
                                    <span className="leading-relaxed font-mono">{item.evidence}</span>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic">
                                    No verifiable mention or project proof found in parsed resume text.
                                </p>
                            )}
                        </div>

                        {/* Interactive Status Override Toggle */}
                        <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0">
                            <span className="text-[11px] text-gray-500 mr-1 hidden sm:inline">Override:</span>
                            <button
                                onClick={() => handleToggleStatus(item.skill, 'matched')}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                    item.status === 'matched'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-navy-700 text-gray-400 hover:text-white'
                                }`}
                                title="Mark as Matched"
                            >
                                Have
                            </button>
                            <button
                                onClick={() => handleToggleStatus(item.skill, 'uncertain')}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                    item.status === 'uncertain'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                        : 'bg-navy-700 text-gray-400 hover:text-white'
                                }`}
                                title="Mark as Partial / Uncertain"
                            >
                                Partial
                            </button>
                            <button
                                onClick={() => handleToggleStatus(item.skill, 'missing')}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                    item.status === 'missing'
                                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                        : 'bg-navy-700 text-gray-400 hover:text-white'
                                }`}
                                title="Mark as Missing"
                            >
                                Need
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
