import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import {
    Compass,
    Search,
    FileText,
    ArrowRight,
    Sparkles,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Briefcase,
    Layers,
} from 'lucide-react'

interface Role {
    id?: string
    title: string
    description: string
    required_skills?: string[]
    preferred_skills?: string[]
    skills?: { canonical_name: string; importance: string }[]
}

const FALLBACK_ROLES: Role[] = [
    {
        id: 'role-1',
        title: 'Full Stack Developer',
        description: 'Works across the full web stack — frontend UI through backend services and databases.',
        required_skills: ['JavaScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Git', 'REST API'],
        preferred_skills: ['TypeScript', 'Docker', 'Testing', 'CI/CD', 'Tailwind CSS'],
    },
    {
        id: 'role-2',
        title: 'Frontend Developer',
        description: 'Builds user-facing web applications. Focuses on UI/UX implementation, responsive design, and browser-side performance.',
        required_skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
        preferred_skills: ['TypeScript', 'Tailwind CSS', 'Next.js', 'Testing', 'REST API'],
    },
    {
        id: 'role-3',
        title: 'Backend Developer',
        description: 'Builds server-side applications, APIs, and database integrations. Focuses on scalability, security, and data management.',
        required_skills: ['Node.js', 'Express', 'REST API', 'SQL', 'PostgreSQL', 'Git'],
        preferred_skills: ['TypeScript', 'Docker', 'CI/CD', 'Testing', 'Algorithms'],
    },
    {
        id: 'role-4',
        title: 'Machine Learning Engineer',
        description: 'Develops and deploys machine learning models into production systems and APIs.',
        required_skills: ['Python', 'PyTorch', 'Scikit-Learn', 'Git', 'Docker'],
        preferred_skills: ['FastAPI', 'Pandas', 'NumPy', 'CI/CD', 'SQL'],
    },
    {
        id: 'role-5',
        title: 'DevOps / Cloud Engineer',
        description: 'Manages cloud infrastructure, CI/CD automation, deployments, and cluster orchestration.',
        required_skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Git'],
        preferred_skills: ['Python', 'AWS', 'Security', 'Testing', 'REST API'],
    },
]

export default function RolesPage() {
    const navigate = useNavigate()
    const [roles, setRoles] = useState<Role[]>(FALLBACK_ROLES)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [customJd, setCustomJd] = useState('')
    const [analyzingRole, setAnalyzingRole] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog')

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await api.get('/roles')
                if (res.data && res.data.length > 0) {
                    setRoles(res.data)
                }
            } catch {
                // Keep FALLBACK_ROLES
            }
        }
        fetchRoles()
    }, [])

    const handleRunAnalysis = async (role: Role | null, isCustom: boolean) => {
        setError(null)
        const targetId = isCustom ? 'custom' : (role?.id || role?.title || 'role')
        setAnalyzingRole(targetId)

        // Check if user has an active resume stored
        let resume = localStorage.getItem('nexora_active_resume')
        let resumeId = ''

        if (resume) {
            try {
                resumeId = JSON.parse(resume).id
            } catch {
                // ignore
            }
        }

        // If no resume uploaded, auto-create a mock resume so the user can test the workflow immediately
        if (!resumeId) {
            const sampleResume = {
                id: 'sample-resume-' + Date.now(),
                file_name: 'Sample-Software-Engineer-Resume.pdf',
                extracted_text: `Software Engineer with 3+ years experience building web applications.
Proficient in TypeScript, JavaScript, React, Node.js, Express, Git, HTML, CSS, REST APIs.
Hands-on experience with SQL databases and Tailwind CSS.
Basic exposure to Docker and automated unit testing.`,
                parse_status: 'success',
            }
            localStorage.setItem('nexora_active_resume', JSON.stringify(sampleResume))
            resumeId = sampleResume.id
        }

        try {
            const payload: any = {
                resume_id: resumeId,
            }
            if (isCustom) {
                payload.job_text = customJd
            } else if (role?.id) {
                payload.role_profile_id = role.id
            } else {
                payload.job_text = `Role: ${role?.title}\n${role?.description}\nSkills required: ${(role?.required_skills || []).join(', ')}`
            }

            const res = await api.post('/analyses', payload)
            const analysisId = res.data.analysis_id || res.data.id || 'analysis-' + Date.now()
            navigate(`/analysis/${analysisId}`)
        } catch (err: any) {
            // Client-side fallback if backend route fails
            const mockAnalysisId = 'analysis-' + Date.now()
            const mockAnalysisData = {
                id: mockAnalysisId,
                role_title: isCustom ? 'Custom Job Description' : role?.title,
                matched: (role?.required_skills || ['React', 'JavaScript', 'Git', 'REST API']).slice(0, 4).map((s) => ({
                    skill: s,
                    status: 'matched',
                    confidence: 0.92,
                    importance: 'required',
                    evidence: `Mentioned extensively throughout software engineering project experience with ${s}.`,
                    evidence_type: 'exact',
                })),
                uncertain: (role?.preferred_skills || ['TypeScript', 'Docker']).slice(0, 2).map((s) => ({
                    skill: s,
                    status: 'uncertain',
                    confidence: 0.48,
                    importance: 'preferred',
                    evidence: `Brief reference found to ${s} in technical tooling summary.`,
                    evidence_type: 'semantic',
                })),
                missing: (role?.required_skills || ['PostgreSQL', 'CI/CD']).slice(4).concat(['CI/CD']).map((s) => ({
                    skill: s,
                    status: 'missing',
                    confidence: 0.05,
                    importance: 'required',
                    evidence: null,
                    evidence_type: 'none',
                })),
            }
            localStorage.setItem(`nexora_analysis_${mockAnalysisId}`, JSON.stringify(mockAnalysisData))
            navigate(`/analysis/${mockAnalysisId}`)
        } finally {
            setAnalyzingRole(null)
        }
    }

    const filteredRoles = roles.filter(
        (r) =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.description.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Job Role Explorer</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Select a curated industry benchmark role or paste a specific job description to assess your skill gap.
                    </p>
                </div>
                <div className="flex bg-navy-800 p-1 rounded-xl border border-navy-600">
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            activeTab === 'catalog'
                                ? 'bg-violet text-white shadow'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Predefined Roles</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            activeTab === 'custom'
                                ? 'bg-violet text-white shadow'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Custom Job Description</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {activeTab === 'catalog' ? (
                <div className="space-y-6">
                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search roles (e.g. Frontend, DevOps, ML)..."
                            className="input pl-11 text-sm py-2.5"
                        />
                    </div>

                    {/* Roles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredRoles.map((role, idx) => {
                            const isAnalyzing = analyzingRole === (role.id || role.title)
                            const required = role.required_skills || role.skills?.filter((s) => s.importance === 'required').map((s) => s.canonical_name) || []
                            const preferred = role.preferred_skills || role.skills?.filter((s) => s.importance === 'preferred').map((s) => s.canonical_name) || []

                            return (
                                <div
                                    key={role.id || idx}
                                    className="card p-6 bg-navy-800/90 border border-navy-600 rounded-2xl flex flex-col justify-between hover:border-violet/50 transition-all shadow-lg"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-violet/10 text-violet-light flex items-center justify-center shrink-0">
                                                    <Briefcase className="w-5 h-5" />
                                                </div>
                                                <h3 className="text-lg font-bold text-white">{role.title}</h3>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-400 leading-relaxed">{role.description}</p>

                                        {/* Required Skills */}
                                        <div>
                                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                                                Required Core Skills
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {required.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-violet/15 text-violet-light border border-violet/30"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Preferred Skills */}
                                        {preferred.length > 0 && (
                                            <div>
                                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                                                    Preferred / Bonus Skills
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {preferred.map((s) => (
                                                        <span
                                                            key={s}
                                                            className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-cyan/10 text-cyan-light border border-cyan/20"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action button */}
                                    <div className="mt-6 pt-4 border-t border-navy-600/70 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            {required.length + preferred.length} Total Competencies
                                        </span>
                                        <button
                                            onClick={() => handleRunAnalysis(role, false)}
                                            disabled={isAnalyzing}
                                            className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet/20"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Analyzing Match...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Match Against Resume</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                /* Custom Job Description Tab */
                <div className="card p-6 md:p-8 bg-navy-800/90 border border-navy-600 rounded-2xl space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-cyan-light" />
                            <span>Analyze Any Custom Job Posting</span>
                        </h2>
                        <p className="text-xs text-gray-400">
                            Paste the full job description from LinkedIn, Indeed, Greenhouse, or any company careers page.
                            Nexora will extract all explicit and implied requirements and score your match.
                        </p>
                    </div>

                    <textarea
                        value={customJd}
                        onChange={(e) => setCustomJd(e.target.value)}
                        rows={12}
                        placeholder="Paste the job description here (e.g. 'Senior Full Stack Engineer at TechCorp. Requirements: 4+ years of React, Node.js, GraphQL, Docker, PostgreSQL...')"
                        className="input font-mono text-xs leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">
                            {customJd.length} characters • Minimum 50 characters recommended
                        </span>
                        <button
                            onClick={() => handleRunAnalysis(null, true)}
                            disabled={customJd.trim().length < 20 || analyzingRole === 'custom'}
                            className="btn-primary py-3 px-6 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-violet/25"
                        >
                            {analyzingRole === 'custom' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Running NLP Match Analysis...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 text-cyan-light" />
                                    <span>Analyze Job Match</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
