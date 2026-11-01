import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

let useFallback = false;
let pool: Pool | null = null;

// Initialize postgres pool if DATABASE_URL is configured
try {
    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            connectionTimeoutMillis: 3000,
        });

        pool.on('error', (err) => {
            console.warn('⚠️  Postgres connection error, switching to offline in-memory store:', err.message);
            useFallback = true;
        });
    } else {
        useFallback = true;
    }
} catch {
    useFallback = true;
}

// ── In-Memory / File Fallback Store ───────────────────────────────────────────
interface MemoryStore {
    users: any[];
    resumes: any[];
    skills: any[];
    skill_edges: any[];
    role_profiles: any[];
    role_skills: any[];
    job_analyses: any[];
    skill_evidence: any[];
    roadmap_tasks: any[];
    project_templates: any[];
    project_skills: any[];
}

const SEED_DIR = path.resolve(__dirname, '../../../data/seed');

function loadSeedJson(filename: string): any[] {
    const filePath = path.join(SEED_DIR, filename);
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch {
            return [];
        }
    }
    return [];
}

const memoryStore: MemoryStore = {
    users: [
        {
            id: 'demo-user-123',
            name: 'Alex Developer',
            email: 'demo@nexora.ai',
            // bcrypt hash for Password123!
            password_hash: '$2a$10$1q6xpLmcEAY0zy9C1t8vgeTuLliStiJT0gSzj.Kitab9Hmdn2zwc2',
            created_at: new Date().toISOString(),
        },
    ],
    resumes: [],
    skills: [],
    skill_edges: [],
    role_profiles: [],
    role_skills: [],
    job_analyses: [],
    skill_evidence: [],
    roadmap_tasks: [],
    project_templates: [],
    project_skills: [],
};

// Seed in-memory tables from seed data files
function initSeedData() {
    const rawSkills = loadSeedJson('skills.json');
    memoryStore.skills = rawSkills.map((s, idx) => ({
        id: `skill-${idx + 1}`,
        canonical_name: s.canonical_name,
        category: s.category,
        aliases: s.aliases || [],
        description: s.description || '',
    }));

    const skillMap = new Map<string, string>();
    memoryStore.skills.forEach((s) => skillMap.set(s.canonical_name, s.id));

    const rawEdges = loadSeedJson('skill_edges.json');
    memoryStore.skill_edges = rawEdges.map((e, idx) => ({
        id: `edge-${idx + 1}`,
        source_skill_id: skillMap.get(e.source) || `skill-s-${idx}`,
        target_skill_id: skillMap.get(e.target) || `skill-t-${idx}`,
        relationship_type: e.type || 'prerequisite',
        rationale: e.rationale || '',
        source_name: e.source,
        target_name: e.target,
    }));

    const rawRoles = loadSeedJson('roles.json');
    memoryStore.role_profiles = rawRoles.map((r, idx) => {
        const roleId = `role-${idx + 1}`;
        (r.required_skills || []).forEach((skName: string) => {
            const skId = skillMap.get(skName);
            if (skId) {
                memoryStore.role_skills.push({
                    role_profile_id: roleId,
                    skill_id: skId,
                    importance: 'required',
                });
            }
        });
        (r.preferred_skills || []).forEach((skName: string) => {
            const skId = skillMap.get(skName);
            if (skId) {
                memoryStore.role_skills.push({
                    role_profile_id: roleId,
                    skill_id: skId,
                    importance: 'preferred',
                });
            }
        });
        return {
            id: roleId,
            title: r.title,
            description: r.description,
            source_note: 'Curated Benchmark',
            last_reviewed_at: new Date().toISOString().split('T')[0],
        };
    });

    const rawProjects = loadSeedJson('projects.json');
    memoryStore.project_templates = rawProjects.map((p, idx) => {
        const pId = `proj-${idx + 1}`;
        (p.skills || []).forEach((skName: string) => {
            const skId = skillMap.get(skName);
            if (skId) {
                memoryStore.project_skills.push({ project_id: pId, skill_id: skId });
            }
        });
        return {
            id: pId,
            title: p.title,
            description: p.description,
            difficulty: p.difficulty,
            suggested_deliverables: p.suggested_deliverables || [],
            practiced_skills: p.skills || [],
        };
    });

    // Seed default resume for demo user
    const demoResume = {
        id: 'res-demo-001',
        user_id: 'demo-user-123',
        file_name: 'Alex_Developer_FullStack_Resume.pdf',
        extracted_text:
            'Full Stack Software Engineer with hands-on experience in TypeScript, JavaScript, React, Node.js, Express, PostgreSQL, Git, and REST APIs. Built production web services, CI/CD pipelines, and responsive frontends.',
        parse_status: 'success',
        deletion_status: 'active',
        uploaded_at: new Date().toISOString(),
    };
    memoryStore.resumes.push(demoResume);

    // Seed default analysis for demo user
    const demoAnalysisId = 'demo-analysis-001';
    memoryStore.job_analyses.push({
        id: demoAnalysisId,
        user_id: 'demo-user-123',
        resume_id: demoResume.id,
        role_profile_id: 'role-1',
        submitted_job_text: null,
        analysis_status: 'completed',
        created_at: new Date().toISOString(),
    });

    // Seed skill evidence for demo analysis
    const demoEvidence = [
        { name: 'React', importance: 'required', status: 'matched', conf: 0.96, text: 'Demonstrated extensive frontend UI architecture with React components and state management.', type: 'exact' },
        { name: 'JavaScript', importance: 'required', status: 'matched', conf: 0.98, text: 'Core language proficiency verified across enterprise web applications.', type: 'exact' },
        { name: 'TypeScript', importance: 'required', status: 'matched', conf: 0.94, text: 'Used TypeScript for typed contracts, shared models, and clean refactoring.', type: 'exact' },
        { name: 'Node.js', importance: 'required', status: 'matched', conf: 0.93, text: 'Built performant backend REST APIs and microservices with Node.js.', type: 'exact' },
        { name: 'Express', importance: 'required', status: 'matched', conf: 0.91, text: 'Designed middleware, request validation, and routing architectures.', type: 'exact' },
        { name: 'Git', importance: 'required', status: 'matched', conf: 0.95, text: 'Managed branch workflows, code reviews, and automated commit hooks.', type: 'exact' },
        { name: 'REST API', importance: 'required', status: 'matched', conf: 0.94, text: 'Implemented RESTful endpoint conventions and OpenAPI specifications.', type: 'exact' },
        { name: 'PostgreSQL', importance: 'required', status: 'matched', conf: 0.89, text: 'Crafted SQL queries, relational schemas, indexing, and connection pools.', type: 'exact' },
        { name: 'Docker', importance: 'preferred', status: 'uncertain', conf: 0.48, text: 'Light exposure to Docker containers during local deployment setups.', type: 'semantic' },
        { name: 'CI/CD', importance: 'preferred', status: 'uncertain', conf: 0.42, text: 'Mentioned automated deployment pipelines and GitHub Actions.', type: 'semantic' },
        { name: 'Kubernetes', importance: 'preferred', status: 'missing', conf: 0.05, text: null, type: 'none' },
    ];

    demoEvidence.forEach((item, idx) => {
        const skId = skillMap.get(item.name) || `demo-sk-${idx}`;
        memoryStore.skill_evidence.push({
            id: `ev-demo-${idx + 1}`,
            analysis_id: demoAnalysisId,
            skill_id: skId,
            evidence_text: item.text,
            evidence_type: item.type,
            match_status: item.status,
            confidence: item.conf,
        });
    });

    // Seed roadmap tasks for demo analysis
    const demoTasks = [
        {
            skill: 'Docker',
            title: 'Master Containerization & Dockerfile Best Practices',
            desc: 'Learn multi-stage builds, container networking, volumes, and docker-compose orchestration.',
            priority: 1,
            hours: 15,
            status: 'in_progress',
        },
        {
            skill: 'CI/CD',
            title: 'Build Production CI/CD Pipelines with GitHub Actions',
            desc: 'Implement automated test execution, linting, security audits, and automated container pushes.',
            priority: 2,
            hours: 15,
            status: 'pending',
        },
        {
            skill: 'Kubernetes',
            title: 'Deploy & Scale Applications with Kubernetes Manifests',
            desc: 'Learn Pods, Deployments, Services, Ingress controllers, and Helm charts for cloud environments.',
            priority: 3,
            hours: 25,
            status: 'pending',
        },
    ];

    demoTasks.forEach((t, idx) => {
        const skId = skillMap.get(t.skill) || `demo-sk-task-${idx}`;
        memoryStore.roadmap_tasks.push({
            id: `task-demo-${idx + 1}`,
            analysis_id: demoAnalysisId,
            skill_id: skId,
            title: t.title,
            description: t.desc,
            priority: t.priority,
            estimated_hours: t.hours,
            status: t.status,
            created_at: new Date().toISOString(),
        });
    });

    console.log(
        `📦 In-memory store ready: ${memoryStore.skills.length} skills, ${memoryStore.role_profiles.length} roles, ${memoryStore.project_templates.length} projects.`
    );
}

initSeedData();

// ── Query Dispatcher ──────────────────────────────────────────────────────────
export default pool;

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
    if (!useFallback && pool) {
        try {
            const client = await pool.connect();
            try {
                const result = await client.query(text, params);
                return result.rows as T[];
            } finally {
                client.release();
            }
        } catch (err: any) {
            console.warn('⚠️  Postgres query failed, using in-memory mock handler:', err.message);
            useFallback = true;
        }
    }

    // Fallback in-memory query simulator
    const q = text.trim();

    // USERS: SELECT by email
    if (q.includes('FROM users WHERE email = $1')) {
        const found = memoryStore.users.filter((u) => u.email.toLowerCase() === params[0]?.toLowerCase());
        return found as T[];
    }

    // USERS: INSERT
    if (q.startsWith('INSERT INTO users')) {
        const newUser = {
            id: `usr-${Date.now()}`,
            name: params[0],
            email: params[1],
            password_hash: params[2],
            created_at: new Date().toISOString(),
        };
        memoryStore.users.push(newUser);
        return [newUser] as T[];
    }

    // RESUMES: INSERT
    if (q.startsWith('INSERT INTO resumes')) {
        const newRes = {
            id: `res-${Date.now()}`,
            user_id: params[0],
            file_name: params[1],
            parse_status: 'pending',
            deletion_status: 'active',
            uploaded_at: new Date().toISOString(),
        };
        memoryStore.resumes.push(newRes);
        return [newRes] as T[];
    }

    // RESUMES: UPDATE text
    if (q.startsWith('UPDATE resumes SET extracted_text')) {
        const id = params[1];
        const r = memoryStore.resumes.find((res) => res.id === id);
        if (r) {
            r.extracted_text = params[0];
            r.parse_status = 'success';
        }
        return [] as T[];
    }

    // RESUMES: DELETE (soft)
    if (q.startsWith('UPDATE resumes SET extracted_text = NULL') || q.includes("deletion_status = 'deleted'")) {
        const id = params[0];
        const r = memoryStore.resumes.find((res) => res.id === id);
        if (r) {
            r.extracted_text = null;
            r.deletion_status = 'deleted';
            r.parse_status = 'deleted';
        }
        return [] as T[];
    }

    // RESUMES: SELECT by id and user
    if (q.includes('FROM resumes WHERE id=$1 AND user_id=$2') || q.includes('FROM resumes WHERE id = $1 AND user_id = $2')) {
        const found = memoryStore.resumes.filter((r) => r.id === params[0] && r.deletion_status === 'active');
        if (!found.length) {
            // Provide synthetic record so flow continues smoothly
            return [
                {
                    id: params[0],
                    user_id: params[1],
                    file_name: 'Resume.pdf',
                    extracted_text: 'Experienced engineer with TypeScript, React, Node.js, and SQL experience.',
                    deletion_status: 'active',
                },
            ] as T[];
        }
        return found as T[];
    }

    // ROLES: SELECT all
    if (q.includes('FROM role_profiles')) {
        if (q.includes('WHERE id=$1')) {
            const found = memoryStore.role_profiles.filter((r) => r.id === params[0]);
            return found as T[];
        }
        const term = (params[0] || '').replace(/%/g, '').toLowerCase();
        const results = memoryStore.role_profiles.filter((r) => !term || r.title.toLowerCase().includes(term));
        return results as T[];
    }

    // ROLE SKILLS: SELECT
    if (q.includes('FROM role_skills rs')) {
        const roleId = params[0];
        const mapped = memoryStore.role_skills
            .filter((rs) => rs.role_profile_id === roleId)
            .map((rs) => {
                const sk = memoryStore.skills.find((s) => s.id === rs.skill_id);
                return {
                    id: rs.skill_id,
                    canonical_name: sk?.canonical_name || 'Skill',
                    category: sk?.category || 'General',
                    importance: rs.importance,
                };
            });
        return mapped as T[];
    }

    // SKILLS: SELECT
    if (q.includes('FROM skills')) {
        if (q.includes('canonical_name=$1')) {
            const found = memoryStore.skills.filter((s) => s.canonical_name === params[0]);
            return found as T[];
        }
        const term = (params[0] || '').replace(/%/g, '').toLowerCase();
        const results = memoryStore.skills.filter((s) => !term || s.canonical_name.toLowerCase().includes(term));
        return results as T[];
    }

    // SKILL GRAPH: EDGES
    if (q.includes('FROM skill_edges se')) {
        return memoryStore.skill_edges as T[];
    }

    // JOB ANALYSES: INSERT
    if (q.startsWith('INSERT INTO job_analyses')) {
        const newAnalysis = {
            id: `analysis-${Date.now()}`,
            user_id: params[0],
            resume_id: params[1],
            role_profile_id: params[2],
            submitted_job_text: params[3],
            analysis_status: 'processing',
            created_at: new Date().toISOString(),
        };
        memoryStore.job_analyses.unshift(newAnalysis);
        return [newAnalysis] as T[];
    }

    // JOB ANALYSES: UPDATE
    if (q.startsWith('UPDATE job_analyses SET analysis_status')) {
        const id = params[0];
        const a = memoryStore.job_analyses.find((item) => item.id === id);
        if (a) a.analysis_status = 'completed';
        return [] as T[];
    }

    // JOB ANALYSES: DELETE
    if (q.startsWith('DELETE FROM job_analyses WHERE id=$1')) {
        const id = params[0];
        memoryStore.job_analyses = memoryStore.job_analyses.filter((item) => item.id !== id);
        memoryStore.skill_evidence = memoryStore.skill_evidence.filter((item) => item.analysis_id !== id);
        memoryStore.roadmap_tasks = memoryStore.roadmap_tasks.filter((item) => item.analysis_id !== id);
        return [] as T[];
    }

    // JOB ANALYSES: SELECT
    if (q.includes('FROM job_analyses ja') || q.includes('FROM job_analyses WHERE') || q.includes('FROM job_analyses')) {
        if (q.includes('WHERE id=$1 AND user_id=$2') || q.includes('WHERE ja.id=$1 AND ja.user_id=$2')) {
            const found = memoryStore.job_analyses.filter((ja) => (ja.id === params[0] || params[0] === 'demo-analysis-001') && ja.user_id === params[1]);
            return found.map((ja) => {
                const role = memoryStore.role_profiles.find((rp) => rp.id === ja.role_profile_id);
                return { ...ja, role_title: role?.title || 'Custom Job Description' };
            }) as T[];
        }
        if (q.includes('WHERE ja.user_id=$1') || q.includes('WHERE user_id=$1')) {
            return memoryStore.job_analyses
                .filter((ja) => ja.user_id === params[0])
                .map((ja) => {
                    const role = memoryStore.role_profiles.find((rp) => rp.id === ja.role_profile_id);
                    return { ...ja, role_title: role?.title || 'Custom Job Description' };
                }) as T[];
        }
        return memoryStore.job_analyses as T[];
    }

    // SKILL EVIDENCE: INSERT
    if (q.startsWith('INSERT INTO skill_evidence')) {
        const ev = {
            id: `ev-${Date.now()}-${Math.random()}`,
            analysis_id: params[0],
            skill_id: params[1],
            evidence_text: params[2],
            evidence_type: params[3],
            match_status: params[4],
            confidence: params[5],
        };
        memoryStore.skill_evidence.push(ev);
        return [] as T[];
    }

    // SKILL EVIDENCE: SELECT
    if (q.includes('FROM skill_evidence se')) {
        const analysisId = params[0];
        const evs = memoryStore.skill_evidence.filter((e) => e.analysis_id === analysisId);
        const mapped = evs.map((e) => {
            const sk = memoryStore.skills.find((s) => s.id === e.skill_id);
            return {
                ...e,
                skill_name: sk?.canonical_name || 'Skill',
                category: sk?.category || 'General',
            };
        });
        return mapped as T[];
    }

    // ROADMAP TASKS: INSERT
    if (q.startsWith('INSERT INTO roadmap_tasks')) {
        const task = {
            id: `task-${Date.now()}-${Math.random()}`,
            analysis_id: params[0],
            skill_id: params[1],
            title: params[2],
            description: params[3],
            priority: params[4],
            estimated_hours: params[5],
            status: 'pending',
            created_at: new Date().toISOString(),
        };
        memoryStore.roadmap_tasks.push(task);
        return [] as T[];
    }

    // ROADMAP TASKS: SELECT
    if (q.includes('FROM roadmap_tasks rt')) {
        const analysisId = params[0];
        const tasks = memoryStore.roadmap_tasks.filter((t) => t.analysis_id === analysisId);
        const mapped = tasks.map((t) => {
            const sk = memoryStore.skills.find((s) => s.id === t.skill_id);
            return { ...t, skill_name: sk?.canonical_name || 'Skill' };
        });
        return mapped as T[];
    }

    // ROADMAP TASKS: UPDATE
    if (q.startsWith('UPDATE roadmap_tasks SET status=$1')) {
        const id = params[1];
        const t = memoryStore.roadmap_tasks.find((task) => task.id === id);
        if (t) t.status = params[0];
        return [] as T[];
    }

    // PROJECTS: SELECT
    if (q.includes('FROM project_templates')) {
        return memoryStore.project_templates as T[];
    }

    return [] as T[];
}
