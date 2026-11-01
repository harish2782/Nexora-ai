import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
    LayoutDashboard,
    FileText,
    Compass,
    Network,
    Map,
    FolderGit2,
    Settings,
    LogOut,
    Menu,
    X,
    Sparkles,
    User,
    ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
    label: string
    path: string
    icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Intelligence', path: '/resume', icon: FileText },
    { label: 'Job Role Explorer', path: '/roles', icon: Compass },
    { label: 'Skill Knowledge Graph', path: '/graph', icon: Network },
    { label: 'Learning Roadmap', path: '/roadmap/latest', icon: Map },
    { label: 'Project Studio', path: '/projects', icon: FolderGit2 },
    { label: 'Settings', path: '/settings', icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const isActive = (path: string) => {
        if (path.startsWith('/roadmap')) {
            return location.pathname.startsWith('/roadmap')
        }
        return location.pathname === path
    }

    return (
        <div className="min-h-screen bg-navy-900 text-gray-100 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-navy-800 border-b border-navy-600">
                <Link to="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-black border border-orange-500 flex items-center justify-center font-black text-orange-400 shadow-md shadow-orange-500/25">
                        N
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">
                        Nexora <span className="text-orange-400">AI</span>
                    </span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 rounded-lg bg-navy-700 text-gray-300 hover:text-white"
                    aria-label="Toggle navigation menu"
                >
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Overlay on mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed md:static inset-y-0 left-0 z-50 w-72 bg-navy-800/95 md:bg-navy-800 border-r border-navy-600/70 flex flex-col transition-transform duration-200 ease-in-out backdrop-blur md:backdrop-blur-none',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
            >
                {/* Brand */}
                <div className="p-6 border-b border-navy-600/60 hidden md:flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-black border-2 border-orange-500 flex items-center justify-center font-black text-orange-400 text-lg shadow-lg shadow-orange-500/30">
                            N
                        </div>
                        <div>
                            <div className="font-bold text-lg tracking-tight text-white">
                                Nexora <span className="text-orange-400">AI</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                Career Intelligence
                            </div>
                        </div>
                    </Link>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet/20 text-violet-light border border-violet/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-light" />
                        v1.0
                    </span>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 px-3 mb-2">
                        Platform Navigation
                    </div>
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.path)
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    active ? 'sidebar-link-active' : 'sidebar-link',
                                    'group relative'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'w-5 h-5 transition-colors',
                                        active ? 'text-black' : 'text-gray-400 group-hover:text-emerald-400'
                                    )}
                                />
                                <span className="flex-1">{item.label}</span>
                                {active && (
                                    <ChevronRight className="w-4 h-4 text-black" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User section & Logout */}
                <div className="p-4 border-t border-navy-600/60 bg-navy-950/40">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-navy-600 border border-navy-500 flex items-center justify-center text-violet-light font-semibold text-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name || 'Explorer'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email || 'user@nexora.ai'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Desktop Topbar */}
                <header className="hidden md:flex items-center justify-between px-8 py-4 bg-navy-800/40 border-b border-navy-600/40 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="text-gray-500">Nexora Intelligence</span>
                        <span>/</span>
                        <span className="text-white font-medium capitalize">
                            {location.pathname.replace('/', '').replace(/-/g, ' ') || 'Dashboard'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            AI Services Online
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
