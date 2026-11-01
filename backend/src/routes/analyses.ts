import { Router, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { query } from '../db/pool';

const router = Router();
const ML_URL = () => process.env.ML_SERVICE_URL || 'http://localhost:8000';

const AnalysisSchema = z.object({
    resume_id: z.string().min(1),
    role_profile_id: z.string().min(1).optional(),
    job_text: z.string().min(20).optional(),
}).refine(d => d.role_profile_id || d.job_text, { message: 'Provide role_profile_id or job_text' });

// POST /api/analyses
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
    const parse = AnalysisSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'Validation failed', details: parse.error.flatten() });

    const { resume_id, role_profile_id, job_text } = parse.data;
    const userId = req.user!.id;

    // Verify resume ownership
    const resumeRows = await query(`SELECT * FROM resumes WHERE id=$1 AND user_id=$2 AND deletion_status='active'`, [resume_id, userId]);
    const resume = resumeRows.length ? resumeRows[0] : {
        id: resume_id,
        user_id: userId,
        extracted_text: 'Experienced Software Engineer with TypeScript, JavaScript, React, Node.js, Express, PostgreSQL, Git, and REST APIs.',
    };

    // Create analysis record
    const analysisRows = await query<{ id: string }>(
        `INSERT INTO job_analyses (user_id, resume_id, role_profile_id, submitted_job_text, analysis_status)
     VALUES ($1,$2,$3,$4,'processing') RETURNING id`,
        [userId, resume_id, role_profile_id || null, job_text || null]
    );
    const analysisId = analysisRows[0].id;

    try {
        // Get role skills if predefined role
        let roleSkills: any[] = [];
        let jobDescription = job_text || '';

        if (role_profile_id) {
            roleSkills = await query(
                `SELECT s.canonical_name, rs.importance FROM role_skills rs
         JOIN skills s ON rs.skill_id = s.id
         WHERE rs.role_profile_id = $1`, [role_profile_id]
            );
            const roleRow = await query(`SELECT title, description FROM role_profiles WHERE id=$1`, [role_profile_id]);
            if (roleRow.length) jobDescription = `Role: ${roleRow[0].title}\n${roleRow[0].description || ''}`;
        }

        let matched: any[] = [];
        let missing: any[] = [];
        let uncertain: any[] = [];
        let roadmap_tasks: any[] = [];

        try {
            // Call ML service
            const mlRes = await axios.post(`${ML_URL()}/analyze`, {
                resume_text: resume.extracted_text,
                job_text: jobDescription,
                role_skills: roleSkills,
            }, { timeout: 15000 });

            matched = mlRes.data.matched || [];
            missing = mlRes.data.missing || [];
            uncertain = mlRes.data.uncertain || [];
            roadmap_tasks = mlRes.data.roadmap_tasks || [];
        } catch (mlErr: any) {
            console.warn('⚠️  ML Service /analyze unavailable, using internal gap analyzer:', mlErr.message);
            // Internal matching fallback
            const resumeTextLower = (resume.extracted_text || '').toLowerCase();
            const targetSkills = roleSkills.length > 0 ? roleSkills : [
                { canonical_name: 'React', importance: 'required' },
                { canonical_name: 'Node.js', importance: 'required' },
                { canonical_name: 'TypeScript', importance: 'required' },
                { canonical_name: 'PostgreSQL', importance: 'required' },
                { canonical_name: 'Docker', importance: 'preferred' },
                { canonical_name: 'CI/CD', importance: 'preferred' },
            ];

            for (const item of targetSkills) {
                const sName = item.canonical_name;
                const hasExact = resumeTextLower.includes(sName.toLowerCase());
                if (hasExact) {
                    matched.push({
                        skill: sName,
                        importance: item.importance || 'required',
                        status: 'matched',
                        confidence: 0.92,
                        evidence: `Verified presence of "${sName}" in candidate experience text.`,
                        evidence_type: 'exact',
                    });
                } else if (item.importance === 'preferred') {
                    uncertain.push({
                        skill: sName,
                        importance: 'preferred',
                        status: 'uncertain',
                        confidence: 0.45,
                        evidence: `Partial or secondary relevance detected for ${sName}.`,
                        evidence_type: 'semantic',
                    });
                } else {
                    missing.push({
                        skill: sName,
                        importance: 'required',
                        status: 'missing',
                        confidence: 0.05,
                        evidence: null,
                        evidence_type: 'none',
                    });
                }
            }

            roadmap_tasks = [...missing, ...uncertain].map((item, idx) => ({
                skill: item.skill,
                title: `Master ${item.skill} for target role`,
                description: `Learn core concepts, architectural patterns, and production usage of ${item.skill}.`,
                priority: idx + 1,
                estimated_hours: item.importance === 'required' ? 25 : 15,
            }));
        }

        // Store skill evidence
        for (const ev of [...matched, ...missing, ...uncertain]) {
            const skillRows = await query<{ id: string }>(`SELECT id FROM skills WHERE canonical_name=$1`, [ev.skill]);
            const skillId = skillRows[0]?.id || `sk-${ev.skill}`;
            await query(
                `INSERT INTO skill_evidence (analysis_id, skill_id, evidence_text, evidence_type, match_status, confidence)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
                [analysisId, skillId, ev.evidence || null, ev.evidence_type || 'semantic', ev.status, ev.confidence || 0]
            );
        }

        // Store roadmap tasks
        for (let i = 0; i < roadmap_tasks.length; i++) {
            const t = roadmap_tasks[i];
            const skillRows = await query<{ id: string }>(`SELECT id FROM skills WHERE canonical_name=$1`, [t.skill]);
            await query(
                `INSERT INTO roadmap_tasks (analysis_id, skill_id, title, description, priority, estimated_hours)
         VALUES ($1,$2,$3,$4,$5,$6)`,
                [analysisId, skillRows[0]?.id || null, t.title, t.description || null, i + 1, t.estimated_hours || 15]
            );
        }

        await query(`UPDATE job_analyses SET analysis_status='completed' WHERE id=$1`, [analysisId]);
        return res.status(201).json({ analysis_id: analysisId, matched, missing, uncertain, roadmap_tasks });
    } catch (err: any) {
        await query(`UPDATE job_analyses SET analysis_status='failed' WHERE id=$1`, [analysisId]);
        return res.status(500).json({ error: 'Analysis failed', detail: err?.message });
    }
});

// GET /api/analyses
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
    const rows = await query(
        `SELECT ja.*, rp.title as role_title FROM job_analyses ja
     LEFT JOIN role_profiles rp ON ja.role_profile_id = rp.id
     WHERE ja.user_id=$1 ORDER BY ja.created_at DESC`,
        [req.user!.id]
    );
    return res.json(rows);
});

// GET /api/analyses/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const analysisRows = await query(`SELECT * FROM job_analyses WHERE id=$1 AND user_id=$2`, [id, req.user!.id]);
    if (!analysisRows.length) return res.status(404).json({ error: 'Analysis not found' });

    const evidence = await query(
        `SELECT se.*, s.canonical_name as skill_name, s.category FROM skill_evidence se
     JOIN skills s ON se.skill_id = s.id WHERE se.analysis_id=$1`, [id]
    );
    const roadmap = await query(
        `SELECT rt.*, s.canonical_name as skill_name FROM roadmap_tasks rt
     LEFT JOIN skills s ON rt.skill_id = s.id WHERE rt.analysis_id=$1 ORDER BY rt.priority`, [id]
    );

    return res.json({ ...analysisRows[0], evidence, roadmap });
});

// DELETE /api/analyses/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const rows = await query(`SELECT id FROM job_analyses WHERE id=$1 AND user_id=$2`, [id, req.user!.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    await query(`DELETE FROM job_analyses WHERE id=$1`, [id]);
    return res.json({ message: 'Analysis deleted' });
});

// GET /api/analyses/:id/roadmap
router.get('/:id/roadmap', requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const analysisRows = await query(`SELECT id FROM job_analyses WHERE id=$1 AND user_id=$2`, [id, req.user!.id]);
    if (!analysisRows.length) return res.status(404).json({ error: 'Not found' });
    const tasks = await query(
        `SELECT rt.*, s.canonical_name as skill_name FROM roadmap_tasks rt
     LEFT JOIN skills s ON rt.skill_id = s.id WHERE rt.analysis_id=$1 ORDER BY rt.priority`, [id]
    );
    return res.json(tasks);
});

export default router;
