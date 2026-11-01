import React, { useState, useEffect } from 'react'
import api from '@/lib/api'
import {
    FolderGit2,
    Search,
    CheckCircle2,
    Sparkles,
    ArrowUpRight,
    Clock,
    Tag,
    Layers,
    ExternalLink,
} from 'lucide-react'

interface Project {
    id?: string
    title: string
    description: string
    skills?: string[]
    practiced_skills?: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    suggested_deliverables?: string[]
}

const FALLBACK_PROJECTS: Project[] = [
    {
        title: 'Full Stack Job Board with PostgreSQL & Express',
        description: 'Design and implement a multi-tenant job board platform with user authentication, resume uploading, search filtering, and relational database persistence.',
        skills: ['Node.js', 'Express', 'PostgreSQL', 'TypeScript', 'REST API', 'Docker'],
        difficulty: 'intermediate',
        suggested_deliverables: [
            'Relational schema migrations',
            'JWT authentication & RBAC',
            'Full-text search queries',
            'Docker Compose deployment',
        ],
    },
    {
        title: 'Real-Time Collaborative Markdown Editor',
        description: 'Build a concurrent collaborative markdown editor using WebSockets, operational transforms, and React with responsive preview rendering.',
        skills: ['React', 'TypeScript', 'Node.js', 'WebSocket', 'Tailwind CSS'],
        difficulty: 'intermediate',
        suggested_deliverables: [
            'Real-time cursor tracking',
            'Conflict-free synchronization',
            'Syntax highlighting preview',
            'Automated unit test coverage',
        ],
    },
    {
        title: 'Microservices CI/CD Pipeline & Orchestration',
        description: 'Automate build, test, container packaging, and deployment of a multi-service architecture using GitHub Actions and Kubernetes manifests.',
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Git'],
        difficulty: 'advanced',
        suggested_deliverables: [
            'Automated staging/prod workflows',
            'Helm chart configurations',
            'Zero-downtime rolling deploys',
            'Health monitoring & alerts',
        ],
    },
    {
        title: 'REST API with Node.js and Express',
        description: 'Build a robust CRUD REST API with comprehensive schema validation, rate limiting, and automated endpoint tests.',
        skills: ['Node.js', 'Express', 'REST API', 'JavaScript', 'Testing'],
        difficulty: 'beginner',
        suggested_deliverables: [
            'CRUD endpoints with status codes',
            'Zod input validation middleware',
            'Centralized error handler',
            'Postman / OpenAPI documentation',
        ],
    },
    {
        title: 'Machine Learning Model Serving with FastAPI',
        description: 'Deploy a fine-tuned transformer or scikit-learn model with high-throughput asynchronous inference endpoints and batch prediction.',
        skills: ['Python', 'FastAPI', 'PyTorch', 'Docker', 'REST API'],
        difficulty: 'advanced',
        suggested_deliverables: [
            'Asynchronous inference handler',
            'Model artifact caching',
            'Docker containerization',
            'Prometheus latency metrics',
        ],
    },
    {
        title: 'Interactive Data Analytics Dashboard',
        description: 'Build an interactive dashboard displaying complex time-series telemetry and metrics with Recharts and custom filter parameters.',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST API'],
        difficulty: 'intermediate',
        suggested_deliverables: [
            'Interactive chart visualizers',
            'Date-range filtering controls',
            'Responsive table layouts',
            'Light / Dark theme toggle',
        ],
    },
]

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS)
    const [search, setSearch] = useState('')
    const [difficulty, setDifficulty] = useState<string>('all')
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/projects')
                if (res.data && res.data.length > 0) {
                    setProjects(res.data)
                }
            } catch {
                // Keep fallback
            }
        }
        fetchProjects()
    }, [])

    const filtered = projects.filter((p) => {
        const matchesDiff = difficulty === 'all' || p.difficulty.toLowerCase() === difficulty.toLowerCase()
        const allSkills = p.skills || p.practiced_skills || []
        const matchesSearch =
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()) ||
            allSkills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
        return matchesDiff && matchesSearch
    })

    const getDifficultyBadge = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'beginner':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            case 'intermediate':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            case 'advanced':
                return 'bg-violet/15 text-violet-light border-violet/30'
            default:
                return 'bg-gray-700 text-gray-300'
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-navy-800/90 border border-navy-600">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Portfolio Remediation Studio</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Project Blueprints</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Curated real-world software engineering projects designed to prove missing competencies on your resume.
                    </p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by skill or project keyword..."
                        className="input pl-10 text-sm py-2.5"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                        <button
                            key={lvl}
                            onClick={() => setDifficulty(lvl)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                                difficulty === lvl
                                    ? 'bg-violet text-white shadow'
                                    : 'bg-navy-800 text-gray-400 hover:text-white border border-navy-600'
                            }`}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((proj, idx) => {
                    const skillsList = proj.skills || proj.practiced_skills || []
                    return (
                        <div
                            key={proj.id || idx}
                            className="card p-6 bg-navy-800/90 border border-navy-600 rounded-2xl flex flex-col justify-between hover:border-violet/50 transition-all shadow-lg group"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDifficultyBadge(
                                            proj.difficulty
                                        )}`}
                                    >
                                        {proj.difficulty}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white group-hover:text-violet-light transition-colors">
                                    {proj.title}
                                </h3>

                                <p className="text-xs text-gray-400 leading-relaxed">
                                    {proj.description}
                                </p>

                                {/* Practiced Skills */}
                                <div>
                                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                                        Practiced Competencies
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {skillsList.map((s) => (
                                            <span
                                                key={s}
                                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-navy-700 text-gray-300 border border-navy-600"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Suggested Deliverables */}
                                {proj.suggested_deliverables && proj.suggested_deliverables.length > 0 && (
                                    <div className="space-y-1.5 pt-2 border-t border-navy-700/60">
                                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
                                            Key Milestones
                                        </span>
                                        {proj.suggested_deliverables.map((del, dIdx) => (
                                            <div
                                                key={dIdx}
                                                className="flex items-center gap-2 text-[11px] text-gray-300"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-light shrink-0" />
                                                <span className="truncate">{del}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action CTA */}
                            <div className="mt-6 pt-4 border-t border-navy-700/60 flex items-center justify-between">
                                <span className="text-[11px] text-gray-500">
                                    {skillsList.length} Core Skills
                                </span>
                                <button
                                    onClick={() => alert(`Starting Blueprint: "${proj.title}"\nUse this architecture to prove ${skillsList.join(', ')} on GitHub!`)}
                                    className="btn-primary py-2 px-3 text-xs font-semibold flex items-center gap-1.5"
                                >
                                    <span>Build Project</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
