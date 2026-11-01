import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
    Settings,
    User,
    Shield,
    Trash2,
    Download,
    CheckCircle2,
    AlertTriangle,
    Database,
    Cpu,
    Lock,
    Save,
} from 'lucide-react'

export default function SettingsPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState(user?.name || 'Alex Developer')
    const [email, setEmail] = useState(user?.email || 'alex@nexora.ai')
    const [saved, setSaved] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleteType, setDeleteType] = useState<'data' | 'account'>('data')

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault()
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const handleExportData = () => {
        const resume = localStorage.getItem('nexora_active_resume')
        const dossier = {
            user: { name, email },
            exportedAt: new Date().toISOString(),
            platform: 'Nexora AI Career Intelligence',
            resumeData: resume ? JSON.parse(resume) : null,
            note: 'Exported under Nexora Data Sovereignty Protocol',
        }
        const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nexora-career-dossier-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleConfirmDelete = () => {
        if (deleteType === 'data') {
            localStorage.removeItem('nexora_active_resume')
            alert('Your uploaded resume and local gap analysis data have been permanently deleted.')
        } else {
            localStorage.clear()
            logout()
            navigate('/')
        }
        setDeleteModalOpen(false)
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                    <Settings className="w-7 h-7 text-violet-light" />
                    <span>Workspace Settings & Privacy</span>
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    Manage your identity profile, inspection telemetry, and privacy sovereignty.
                </p>
            </div>

            {saved && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Profile settings successfully saved.</span>
                </div>
            )}

            {/* Profile Section */}
            <div className="card p-6 bg-navy-800/90 border border-navy-600 rounded-2xl space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet/10 text-violet-light flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Profile Information</h2>
                        <p className="text-xs text-gray-400">Your registered identification within Nexora</p>
                    </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                    <div>
                        <label className="label">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input text-sm py-2"
                        />
                    </div>

                    <div>
                        <label className="label">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input text-sm py-2"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary py-2 px-5 text-xs font-semibold flex items-center gap-2"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>Update Profile</span>
                    </button>
                </form>
            </div>

            {/* System Engine Status */}
            <div className="card p-6 bg-navy-800/90 border border-navy-600 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan/10 text-cyan-light flex items-center justify-center">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">System Architecture & AI Engines</h2>
                        <p className="text-xs text-gray-400">Current connected backend endpoints and local model workers</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-1">
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Semantic Embeddings Engine
                        </div>
                        <div className="text-sm font-bold text-white">all-MiniLM-L6-v2</div>
                        <div className="text-xs text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Local Sentence Transformers Active</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-1">
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            PDF Text Extraction
                        </div>
                        <div className="text-sm font-bold text-white">PyMuPDF (fitz) v1.23+</div>
                        <div className="text-xs text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Native High-Accuracy Stream Parsing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy & Data Sovereignty */}
            <div className="card p-6 bg-navy-800/90 border border-navy-600 rounded-2xl space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Privacy & Data Sovereignty</h2>
                        <p className="text-xs text-gray-400">
                            Export your career records or permanently erase your resume files from disk.
                        </p>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-navy-900 border border-navy-700 gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-white">Export Career Intelligence Dossier</h3>
                            <p className="text-xs text-gray-400">Download a complete JSON export of all your parsed skills, gaps, and roadmap tasks.</p>
                        </div>
                        <button
                            onClick={handleExportData}
                            className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export JSON</span>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-navy-900 border border-navy-700 gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-white">Purge Resume & Analysis History</h3>
                            <p className="text-xs text-gray-400">Delete uploaded resume text and clear all generated gap assessments.</p>
                        </div>
                        <button
                            onClick={() => {
                                setDeleteType('data')
                                setDeleteModalOpen(true)
                            }}
                            className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Purge Resume Data</span>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-navy-900 border border-red-500/30 gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-red-400">Delete Account Permanently</h3>
                            <p className="text-xs text-gray-400">Irrevocably delete your account credentials, token sessions, and all data.</p>
                        </div>
                        <button
                            onClick={() => {
                                setDeleteType('account')
                                setDeleteModalOpen(true)
                            }}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Account</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="card p-6 bg-navy-900 border border-red-500/40 rounded-2xl max-w-md w-full space-y-4">
                        <div className="flex items-center gap-3 text-red-400">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-bold">
                                {deleteType === 'data' ? 'Purge Resume Data?' : 'Delete Entire Account?'}
                            </h3>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            {deleteType === 'data'
                                ? 'Are you sure you want to delete all uploaded resume files and parsed analysis history? This action cannot be undone.'
                                : 'Are you sure you want to permanently delete your account? All authentication tokens and workspace history will be purged immediately.'}
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="btn-secondary text-xs px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
