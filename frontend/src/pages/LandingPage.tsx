import React from 'react'
import { Link } from 'react-router-dom'
import {
    Sparkles,
    ArrowRight,
    FileText,
    Network,
    Map,
    FolderGit2,
    CheckCircle2,
    ShieldCheck,
    Compass,
    Cpu,
} from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-navy-900 text-gray-100 flex flex-col selection:bg-violet selection:text-white">
            {/* Top Navigation */}
            <header className="border-b border-navy-600/60 bg-navy-900/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black border-2 border-orange-500 flex items-center justify-center font-black text-orange-400 text-xl shadow-lg shadow-orange-500/30">
                            N
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">
                            Nexora <span className="text-orange-400">AI</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="btn-primary text-sm flex items-center gap-2 shadow-lg shadow-violet/25"
                        >
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
                {/* Background glow effects */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-violet/20 via-cyan/20 to-violet/10 blur-[120px] rounded-full pointer-events-none -z-10" />

                <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet/10 border border-violet/30 text-violet-light text-xs font-semibold uppercase tracking-wider animate-fade-in">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-light" />
                        Next-Generation Career Intelligence
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                        Bridge the gap between your resume and{' '}
                        <span className="bg-gradient-to-r from-violet-light via-cyan-light to-violet bg-clip-text text-transparent">
                            your dream role.
                        </span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-400 font-normal leading-relaxed">
                        Nexora AI performs semantic skill extraction, explainable gap analysis, prerequisite knowledge
                        graphs, and generates personalized learning roadmaps tailored to your career trajectory.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
                        >
                            <span>Analyze Your Resume Free</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-navy-800 hover:bg-navy-700 text-emerald-300 border border-navy-600 font-semibold text-base flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>Sign in with Demo Account</span>
                        </Link>
                    </div>

                    {/* Trust / Capability Badges */}
                    <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>100% Explainable Evidence</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-cyan-light" />
                            <span>Sentence Transformer NLP</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Network className="w-4 h-4 text-violet-light" />
                            <span>Prerequisite Knowledge Graphs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Privacy & Zero-Retention Control</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Highlights Grid */}
            <section className="py-20 bg-navy-950/60 border-t border-b border-navy-600/40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            A Full-Spectrum Intelligence Engine
                        </h2>
                        <p className="text-gray-400">
                            Traditional ATS systems reject resumes blindly. Nexora provides transparency, precision scoring,
                            and actionable remediation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="card-hover p-6 rounded-2xl bg-navy-800/80 border border-navy-600 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-violet/10 border border-violet/30 flex items-center justify-center text-violet-light mb-5">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Deep Resume Intelligence</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Extracts structured text from PDF resumes using PyMuPDF, identifying canonical skills and
                                    mapping aliases to standardized taxonomy categories.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-navy-600/60 flex items-center text-xs text-violet-light font-medium">
                                <span>Multi-page PDF parsing</span>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="card-hover p-6 rounded-2xl bg-navy-800/80 border border-navy-600 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan-light mb-5">
                                    <Compass className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Explainable Gap Analysis</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Classifies skills into Matched, Missing, and Uncertain with confidence percentages, backed by
                                    verifiable quotes from your resume.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-navy-600/60 flex items-center text-xs text-cyan-light font-medium">
                                <span>Zero black-box verdicts</span>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="card-hover p-6 rounded-2xl bg-navy-800/80 border border-navy-600 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-violet/10 border border-violet/30 flex items-center justify-center text-violet-light mb-5">
                                    <Network className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Prerequisite Skill Graph</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Interactive 2D graph powered by NetworkX and React Flow that maps prerequisite dependencies
                                    so you never learn advanced topics out of order.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-navy-600/60 flex items-center text-xs text-violet-light font-medium">
                                <span>Topological sequencing</span>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="card-hover p-6 rounded-2xl bg-navy-800/80 border border-navy-600 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan-light mb-5">
                                    <Map className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Dynamic Learning Roadmap</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Step-by-step milestone checklist prioritizing required role competencies with estimated study
                                    hours and progress status tracking.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-navy-600/60 flex items-center text-xs text-cyan-light font-medium">
                                <span>Interactive progress tracking</span>
                            </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="card-hover p-6 rounded-2xl bg-navy-800/80 border border-navy-600 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-violet/10 border border-violet/30 flex items-center justify-center text-violet-light mb-5">
                                    <FolderGit2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Project Recommendation Studio</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Connects missing competencies directly to portfolio project templates that prove those exact
                                    skills on GitHub and in technical interviews.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-navy-600/60 flex items-center text-xs text-violet-light font-medium">
                                <span>30+ Curated Project Blueprints</span>
                            </div>
                        </div>

                        {/* Feature 6 */}
                        <div className="card-hover p-6 rounded-2xl bg-navy-800/80 border border-navy-600 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan-light mb-5">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Privacy & Full Control</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Your data belongs to you. Export your complete career dossier anytime or permanently delete
                                    resumes and analyses with a single click.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-navy-600/60 flex items-center text-xs text-cyan-light font-medium">
                                <span>Instant data purge</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="card p-10 md:p-14 rounded-3xl bg-gradient-to-r from-violet/20 via-navy-800 to-cyan/20 border border-violet/40 text-center space-y-6 relative overflow-hidden">
                        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                            Ready to accelerate your career?
                        </h2>
                        <p className="max-w-2xl mx-auto text-gray-300 text-base sm:text-lg">
                            Upload your resume, pick a target role or paste any job description, and get a complete
                            actionable roadmap in seconds.
                        </p>
                        <div className="pt-2 flex justify-center">
                            <Link
                                to="/register"
                                className="px-8 py-4 rounded-xl bg-violet hover:bg-violet-dark text-white font-semibold text-base shadow-lg shadow-violet/30 flex items-center gap-2"
                            >
                                <span>Launch Nexora Free</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-navy-600/60 bg-navy-950 py-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-black border border-orange-500 flex items-center justify-center font-bold text-orange-400 text-xs shadow-sm shadow-orange-500/20">
                            N
                        </div>
                        <span className="font-semibold text-gray-300">Nexora <span className="text-orange-400">AI</span> Platform</span>
                        <span>— Autonomous Career Intelligence</span>
                    </div>
                    <div>
                        Built with React 18, Node.js, FastAPI & PyMuPDF
                    </div>
                </div>
            </footer>
        </div>
    )
}
