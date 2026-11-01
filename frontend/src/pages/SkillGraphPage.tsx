import React, { useState, useEffect, useMemo, useCallback } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    MarkerType,
    useNodesState,
    useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
    Network,
    Search,
    Info,
    Sparkles,
    ArrowRight,
    Layers,
    Compass,
    FolderGit2,
    X,
} from 'lucide-react'
import api from '@/lib/api'
import { Link } from 'react-router-dom'

interface SkillItem {
    canonical_name: string
    category: string
    description?: string
    aliases?: string[]
}

interface EdgeItem {
    source: string
    target: string
    type: string
    rationale?: string
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    'Programming Language': { bg: 'rgba(16, 185, 129, 0.25)', border: '#10B981', text: '#6EE7B7' },
    'Frontend Framework': { bg: 'rgba(34, 197, 94, 0.25)', border: '#22C55E', text: '#86EFAC' },
    'Backend Framework': { bg: 'rgba(5, 150, 105, 0.25)', border: '#059669', text: '#A7F3D0' },
    Database: { bg: 'rgba(52, 211, 153, 0.25)', border: '#34D399', text: '#D1FAE5' },
    DevOps: { bg: 'rgba(74, 222, 128, 0.25)', border: '#4ADE80', text: '#BBF7D0' },
    'AI/ML': { bg: 'rgba(0, 255, 128, 0.25)', border: '#00E676', text: '#A7F3D0' },
    Markup: { bg: 'rgba(20, 184, 166, 0.25)', border: '#14B8A6', text: '#99F6E4' },
    Styling: { bg: 'rgba(13, 148, 136, 0.25)', border: '#0D9488', text: '#5EEAD4' },
    Architecture: { bg: 'rgba(4, 120, 87, 0.25)', border: '#047857', text: '#6EE7B7' },
    'Quality Assurance': { bg: 'rgba(163, 230, 53, 0.25)', border: '#A3E635', text: '#D9F99D' },
}

const DEFAULT_COLOR = { bg: 'rgba(20, 30, 23, 0.8)', border: '#2A3F30', text: '#86EFAC' }

export default function SkillGraphPage() {
    const [skills, setSkills] = useState<SkillItem[]>([])
    const [edgesData, setEdgesData] = useState<EdgeItem[]>([])
    const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null)
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('All')

    // Initial fetch
    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const res = await api.get('/skills/graph')
                if (res.data?.nodes && res.data?.edges) {
                    setSkills(res.data.nodes)
                    setEdgesData(
                        res.data.edges.map((e: any) => ({
                            source: e.source_name || e.source,
                            target: e.target_name || e.target,
                            type: e.relationship_type || e.type,
                            rationale: e.rationale,
                        }))
                    )
                    return
                }
            } catch {
                // Fallback to built-in seed dataset
            }

            // Fallback seed data
            const fallbackSkills: SkillItem[] = [
                { canonical_name: 'HTML', category: 'Markup', description: 'Standard markup language for web structure.' },
                { canonical_name: 'CSS', category: 'Styling', description: 'Style sheet language for layout and appearance.' },
                { canonical_name: 'JavaScript', category: 'Programming Language', description: 'Core interactive language of the web.' },
                { canonical_name: 'TypeScript', category: 'Programming Language', description: 'Typed superset of JavaScript.' },
                { canonical_name: 'React', category: 'Frontend Framework', description: 'Component-based UI library.' },
                { canonical_name: 'Next.js', category: 'Frontend Framework', description: 'Full-stack React framework.' },
                { canonical_name: 'Tailwind CSS', category: 'Styling', description: 'Utility-first CSS framework.' },
                { canonical_name: 'Node.js', category: 'Backend Framework', description: 'JavaScript runtime environment.' },
                { canonical_name: 'Express', category: 'Backend Framework', description: 'Minimalist web framework for Node.' },
                { canonical_name: 'REST API', category: 'Architecture', description: 'Representational State Transfer web APIs.' },
                { canonical_name: 'SQL', category: 'Database', description: 'Standard language for relational databases.' },
                { canonical_name: 'PostgreSQL', category: 'Database', description: 'Advanced open-source relational database.' },
                { canonical_name: 'Docker', category: 'DevOps', description: 'Platform for containerized software.' },
                { canonical_name: 'CI/CD', category: 'DevOps', description: 'Continuous integration and continuous delivery.' },
                { canonical_name: 'Git', category: 'DevOps', description: 'Distributed version control system.' },
                { canonical_name: 'Python', category: 'Programming Language', description: 'High-level general-purpose language.' },
                { canonical_name: 'PyTorch', category: 'AI/ML', description: 'Deep learning framework for Python.' },
                { canonical_name: 'FastAPI', category: 'Backend Framework', description: 'High-performance Python web framework.' },
            ]

            const fallbackEdges: EdgeItem[] = [
                { source: 'HTML', target: 'CSS', type: 'prerequisite', rationale: 'Markup required before styling.' },
                { source: 'HTML', target: 'JavaScript', type: 'prerequisite', rationale: 'DOM structure needed before JS scripting.' },
                { source: 'CSS', target: 'Tailwind CSS', type: 'prerequisite', rationale: 'CSS fundamentals needed for utility classes.' },
                { source: 'JavaScript', target: 'TypeScript', type: 'prerequisite', rationale: 'TS is a typed superset of JS.' },
                { source: 'JavaScript', target: 'React', type: 'prerequisite', rationale: 'React is a JavaScript framework.' },
                { source: 'JavaScript', target: 'Node.js', type: 'prerequisite', rationale: 'Node runs JavaScript on the server.' },
                { source: 'React', target: 'Next.js', type: 'prerequisite', rationale: 'Next.js extends React architecture.' },
                { source: 'Node.js', target: 'Express', type: 'prerequisite', rationale: 'Express runs on Node runtime.' },
                { source: 'Express', target: 'REST API', type: 'prerequisite', rationale: 'Express is used to build REST endpoints.' },
                { source: 'SQL', target: 'PostgreSQL', type: 'prerequisite', rationale: 'SQL syntax is fundamental for PostgreSQL.' },
                { source: 'Node.js', target: 'PostgreSQL', type: 'prerequisite', rationale: 'Server connects to relational storage.' },
                { source: 'Git', target: 'CI/CD', type: 'prerequisite', rationale: 'Git commits trigger CI/CD pipelines.' },
                { source: 'Docker', target: 'CI/CD', type: 'prerequisite', rationale: 'Containers are deployed in automated pipelines.' },
                { source: 'Python', target: 'PyTorch', type: 'prerequisite', rationale: 'PyTorch is a Python deep learning library.' },
                { source: 'Python', target: 'FastAPI', type: 'prerequisite', rationale: 'FastAPI is written in Python.' },
            ]

            setSkills(fallbackSkills)
            setEdgesData(fallbackEdges)
        }

        fetchGraph()
    }, [])

    // Compute categories
    const categories = useMemo(() => {
        const set = new Set(skills.map((s) => s.category).filter(Boolean))
        return ['All', ...Array.from(set)]
    }, [skills])

    // Layout nodes into a readable grid/graph layout
    const initialNodes: Node[] = useMemo(() => {
        const categoryGroups: Record<string, SkillItem[]> = {}
        skills.forEach((s) => {
            const cat = s.category || 'Other'
            if (!categoryGroups[cat]) categoryGroups[cat] = []
            categoryGroups[cat].push(s)
        })

        const nodes: Node[] = []
        let catIndex = 0

        Object.entries(categoryGroups).forEach(([cat, catSkills]) => {
            const colX = catIndex * 260
            catSkills.forEach((skill, itemIndex) => {
                const colors = CATEGORY_COLORS[skill.category] || DEFAULT_COLOR
                const matchesSearch =
                    search && skill.canonical_name.toLowerCase().includes(search.toLowerCase())
                const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory

                nodes.push({
                    id: skill.canonical_name,
                    position: { x: colX, y: itemIndex * 110 },
                    data: {
                        label: (
                            <div className="text-left select-none">
                                <div className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                                    {skill.category}
                                </div>
                                <div className="text-xs font-bold text-white mt-0.5">
                                    {skill.canonical_name}
                                </div>
                            </div>
                        ),
                        skill,
                    },
                    style: {
                        background: colors.bg,
                        borderColor: matchesSearch ? '#00f0ff' : colors.border,
                        borderWidth: matchesSearch ? 2 : 1.5,
                        borderRadius: '12px',
                        padding: '10px 14px',
                        color: '#fff',
                        width: 190,
                        opacity: matchesCategory ? 1 : 0.25,
                        boxShadow: matchesSearch
                            ? '0 0 15px rgba(0, 240, 255, 0.4)'
                            : '0 4px 12px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease',
                    },
                })
            })
            catIndex++
        })

        return nodes
    }, [skills, search, selectedCategory])

    const initialEdges: Edge[] = useMemo(() => {
        return edgesData.map((e, idx) => ({
            id: `edge-${idx}-${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
            animated: true,
            style: { stroke: '#7C3AED', strokeWidth: 1.5 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#7C3AED',
            },
        }))
    }, [edgesData])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    useEffect(() => {
        setNodes(initialNodes)
        setEdges(initialEdges)
    }, [initialNodes, initialEdges, setNodes, setEdges])

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            const skillItem = skills.find((s) => s.canonical_name === node.id)
            if (skillItem) {
                setSelectedSkill(skillItem)
            }
        },
        [skills]
    )

    // Prerequisites and Next Skills for selected node
    const prerequisites = useMemo(() => {
        if (!selectedSkill) return []
        return edgesData
            .filter((e) => e.target === selectedSkill.canonical_name)
            .map((e) => ({ name: e.source, rationale: e.rationale }))
    }, [selectedSkill, edgesData])

    const unlocks = useMemo(() => {
        if (!selectedSkill) return []
        return edgesData
            .filter((e) => e.source === selectedSkill.canonical_name)
            .map((e) => ({ name: e.target, rationale: e.rationale }))
    }, [selectedSkill, edgesData])

    return (
        <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        <Network className="w-6 h-6 text-violet-light" />
                        <span>Skill Knowledge Graph</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Interactive dependency graph illustrating prerequisite pathways across {skills.length} technical skills.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find skill..."
                            className="input pl-9 text-xs py-1.5 w-44"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-navy-800 border border-navy-600 rounded-lg text-xs py-1.5 px-3 text-white focus:outline-none"
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Graph Canvas Container */}
            <div className="flex-1 bg-navy-950 border border-navy-700/80 rounded-2xl relative overflow-hidden flex shadow-2xl">
                <div className="flex-1 h-full">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        fitView
                        attributionPosition="bottom-left"
                    >
                        <Background color="#1F2937" gap={20} size={1} />
                        <Controls className="bg-navy-800 border border-navy-600 fill-white text-white rounded-lg" />
                        <MiniMap
                            nodeColor={(n) => {
                                const skill = skills.find((s) => s.canonical_name === n.id)
                                return CATEGORY_COLORS[skill?.category || '']?.border || '#7C3AED'
                            }}
                            className="bg-navy-900 border border-navy-700 rounded-xl overflow-hidden"
                            maskColor="rgba(10, 15, 30, 0.7)"
                        />
                    </ReactFlow>
                </div>

                {/* Inspection Drawer on Click */}
                {selectedSkill && (
                    <div className="w-80 md:w-96 bg-navy-900/95 border-l border-navy-700 p-6 flex flex-col justify-between overflow-y-auto backdrop-blur z-20 animate-slide-up">
                        <div className="space-y-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-light">
                                        {selectedSkill.category}
                                    </span>
                                    <h2 className="text-xl font-bold text-white mt-0.5">
                                        {selectedSkill.canonical_name}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedSkill(null)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-navy-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed">
                                {selectedSkill.description ||
                                    'Core industry competency widely required in modern cloud and web engineering architectures.'}
                            </p>

                            {/* Prerequisites */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                    Direct Prerequisites ({prerequisites.length})
                                </span>
                                {prerequisites.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">No hard prerequisites (Foundational skill).</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {prerequisites.map((p) => (
                                            <div
                                                key={p.name}
                                                className="p-2.5 rounded-lg bg-navy-800 border border-navy-700 text-xs"
                                            >
                                                <div className="font-semibold text-white">{p.name}</div>
                                                {p.rationale && (
                                                    <div className="text-[11px] text-gray-400 mt-0.5">
                                                        {p.rationale}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Unlocks */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                    Unlocks Next ({unlocks.length})
                                </span>
                                {unlocks.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">Terminal competency in this branch.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {unlocks.map((u) => (
                                            <span
                                                key={u.name}
                                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-cyan/10 text-cyan-light border border-cyan/20"
                                            >
                                                {u.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-6 border-t border-navy-700/80">
                            <Link
                                to="/projects"
                                className="w-full btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
                            >
                                <FolderGit2 className="w-4 h-4" />
                                <span>Find Projects Practicing {selectedSkill.canonical_name}</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
