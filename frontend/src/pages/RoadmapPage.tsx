import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '@/lib/api'
import {
    Map,
    CheckCircle2,
    Clock,
    Circle,
    ArrowRight,
    FolderGit2,
    Calendar,
    Sparkles,
    Loader2,
    Layers,
    Share2,
} from 'lucide-react'

interface RoadmapTask {
    id: string
    skill: string
    title: string
    description?: string
    priority: number
    estimated_hours: number
    status: 'pending' | 'in_progress' | 'completed'
    importance?: string
}

export default function RoadmapPage() {
    const { analysisId } = useParams<{ analysisId: string }>()
    const [tasks, setTasks] = useState<RoadmapTask[]>([])
    const [loading, setLoading] = useState(true)
    const [weeklyHours, setWeeklyHours] = useState(10)

    useEffect(() => {
        const fetchRoadmap = async () => {
            setLoading(true)
            try {
                if (analysisId && analysisId !== 'latest') {
                    const res = await api.get(`/analyses/${analysisId}/roadmap`)
                    if (res.data && res.data.length > 0) {
                        setTasks(
                            res.data.map((t: any) => ({
                                id: t.id,
                                skill: t.skill_name || t.skill || 'Skill',
                                title: t.title,
                                description: t.description,
                                priority: t.priority,
                                estimated_hours: t.estimated_hours || 20,
                                status: t.status || 'pending',
                                importance: t.importance || 'required',
                            }))
                        )
                        return
                    }
                }
            } catch {
                // Check localStorage
            }

            // Fallback prioritized learning roadmap
            setTasks([
                {
                    id: 'task-1',
                    skill: 'PostgreSQL',
                    title: 'Master Relational Database Architecture & PostgreSQL',
                    description: 'Learn SQL schema design, indexing, foreign keys, query optimization, and connection pooling.',
                    priority: 1,
                    estimated_hours: 20,
                    status: 'in_progress',
                    importance: 'required',
                },
                {
                    id: 'task-2',
                    skill: 'Docker',
                    title: 'Containerization Fundamentals with Docker',
                    description: 'Author multi-stage Dockerfiles, configure volume persistence, and write docker-compose environments.',
                    priority: 2,
                    estimated_hours: 15,
                    status: 'pending',
                    importance: 'preferred',
                },
                {
                    id: 'task-3',
                    skill: 'CI/CD',
                    title: 'Automated CI/CD Workflows with GitHub Actions',
                    description: 'Build automated continuous integration pipelines with automated linting, unit testing, and deployment stages.',
                    priority: 3,
                    estimated_hours: 15,
                    status: 'pending',
                    importance: 'preferred',
                },
                {
                    id: 'task-4',
                    skill: 'TypeScript',
                    title: 'Deepen TypeScript Strict Mode & Generics',
                    description: 'Strengthen typing across asynchronous API contracts, generics, utility types, and strict compiler configs.',
                    priority: 4,
                    estimated_hours: 25,
                    status: 'pending',
                    importance: 'required',
                },
            ])
            setLoading(false)
        }

        fetchRoadmap()
    }, [analysisId])

    const handleStatusToggle = async (taskId: string, currentStatus: RoadmapTask['status']) => {
        const nextStatus: RoadmapTask['status'] =
            currentStatus === 'pending'
                ? 'in_progress'
                : currentStatus === 'in_progress'
                ? 'completed'
                : 'pending'

        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
        )

        try {
            await api.patch(`/roadmap-tasks/${taskId}`, { status: nextStatus })
        } catch {
            // Keep local state
        }
    }

    const completedTasks = tasks.filter((t) => t.status === 'completed')
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
    const totalHours = tasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0)
    const remainingHours = tasks
        .filter((t) => t.status !== 'completed')
        .reduce((acc, t) => acc + (t.estimated_hours || 0), 0)

    const estimatedWeeks = Math.ceil(remainingHours / (weeklyHours || 1))
    const progressPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-violet-light animate-spin" />
                <p className="text-sm text-gray-400">Synthesizing personalized learning milestones...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-navy-800/90 border border-navy-600">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-light mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Dynamic Prerequisite Learning Path</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Career Roadmap</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Topologically sequenced milestones to bridge verified skill gaps in optimal order.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/projects"
                        className="btn-primary py-2.5 px-4 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet/20"
                    >
                        <FolderGit2 className="w-4 h-4" />
                        <span>Practice with Projects</span>
                    </Link>
                </div>
            </div>

            {/* Progress & Estimation Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Completion Metric */}
                <div className="card p-5 bg-navy-800 border border-navy-600 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Roadmap Progress
                        </span>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-2">
                        {completedTasks.length} / {tasks.length} Completed
                    </div>
                    <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden mt-3">
                        <div
                            className="bg-gradient-to-r from-violet to-emerald-400 h-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Remaining Effort */}
                <div className="card p-5 bg-navy-800 border border-navy-600 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Study Effort
                        </span>
                        <Clock className="w-5 h-5 text-cyan-light" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-2">{remainingHours} Hours</div>
                    <div className="text-xs text-gray-400 mt-1">
                        Total curriculum: {totalHours} hrs
                    </div>
                </div>

                {/* Time to Readiness */}
                <div className="card p-5 bg-navy-800 border border-navy-600 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Readiness Horizon
                        </span>
                        <Calendar className="w-5 h-5 text-violet-light" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-2">~{estimatedWeeks} Weeks</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-400">At</span>
                        <input
                            type="number"
                            min="2"
                            max="40"
                            value={weeklyHours}
                            onChange={(e) => setWeeklyHours(Number(e.target.value) || 10)}
                            className="w-12 bg-navy-900 border border-navy-600 rounded px-1.5 py-0.5 text-xs text-white text-center"
                        />
                        <span className="text-[11px] text-gray-400">hrs/week</span>
                    </div>
                </div>
            </div>

            {/* Task Checklist */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-violet-light" />
                        <span>Curated Milestones ({tasks.length})</span>
                    </h2>
                    <span className="text-xs text-gray-400">Click circle to update task status</span>
                </div>

                {tasks.map((task, index) => {
                    const isCompleted = task.status === 'completed'
                    const isInProgress = task.status === 'in_progress'

                    return (
                        <div
                            key={task.id}
                            className={`card p-5 bg-navy-800/90 border rounded-2xl transition-all flex items-start gap-4 ${
                                isCompleted
                                    ? 'border-emerald-500/30 opacity-70 bg-navy-800/50'
                                    : isInProgress
                                    ? 'border-violet/60 shadow-lg shadow-violet/10'
                                    : 'border-navy-600'
                            }`}
                        >
                            {/* Status Checkbox Button */}
                            <button
                                onClick={() => handleStatusToggle(task.id, task.status)}
                                className="mt-1 shrink-0 transition-transform active:scale-95"
                                title="Click to cycle status: Pending → In Progress → Completed"
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                ) : isInProgress ? (
                                    <div className="w-6 h-6 rounded-full border-2 border-violet bg-violet/20 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-violet animate-pulse" />
                                    </div>
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-500 hover:text-gray-300" />
                                )}
                            </button>

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-violet-light uppercase tracking-wider">
                                        Milestone {index + 1}
                                    </span>
                                    <span className="text-gray-500">•</span>
                                    <span
                                        className={`text-base font-bold ${
                                            isCompleted ? 'line-through text-gray-400' : 'text-white'
                                        }`}
                                    >
                                        {task.title}
                                    </span>

                                    {/* Badges */}
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-navy-700 text-gray-300 border border-navy-600">
                                        {task.skill}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet/15 text-violet-light border border-violet/30">
                                        ~{task.estimated_hours}h
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                            task.status === 'completed'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : task.status === 'in_progress'
                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                : 'bg-navy-700 text-gray-400'
                                        }`}
                                    >
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
                                    {task.description}
                                </p>
                            </div>

                            {/* Practice CTA */}
                            <Link
                                to="/projects"
                                className="hidden sm:flex items-center gap-1 text-xs text-violet-light hover:text-white shrink-0 py-1.5 px-3 rounded-lg bg-navy-700/60 hover:bg-navy-700 border border-navy-600 transition-colors"
                            >
                                <FolderGit2 className="w-3.5 h-3.5" />
                                <span>Projects</span>
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
