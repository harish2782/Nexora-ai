import { Router, Response, Request } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { query } from '../db/pool';

const router = Router();

// GET /api/projects/recommendations?analysis_id=...
router.get('/recommendations', requireAuth, async (req: AuthRequest, res: Response) => {
    const analysisId = req.query.analysis_id as string;
    if (!analysisId) return res.status(400).json({ error: 'analysis_id is required' });

    // Verify ownership
    const analysisRows = await query(
        `SELECT id FROM job_analyses WHERE id=$1 AND user_id=$2`, [analysisId, req.user!.id]
    );
    if (!analysisRows.length) return res.status(404).json({ error: 'Analysis not found' });

    // Get missing skills from the analysis
    const missingSkills = await query(
        `SELECT se.skill_id, s.canonical_name FROM skill_evidence se
     JOIN skills s ON se.skill_id = s.id
     WHERE se.analysis_id=$1 AND se.match_status IN ('missing','uncertain')
     ORDER BY se.confidence ASC LIMIT 10`,
        [analysisId]
    );

    if (!missingSkills.length) return res.json([]);

    const skillIds = missingSkills.map((s: any) => s.skill_id);
    const placeholders = skillIds.map((_: any, i: number) => `$${i + 1}`).join(',');

    const projects = await query(
        `SELECT DISTINCT pt.*, array_agg(s.canonical_name) as practiced_skills
     FROM project_templates pt
     JOIN project_skills ps ON pt.id = ps.project_id
     JOIN skills s ON ps.skill_id = s.id
     WHERE ps.skill_id IN (${placeholders})
     GROUP BY pt.id
     ORDER BY pt.difficulty LIMIT 10`,
        skillIds
    );

    return res.json(projects);
});

// GET /api/projects (browse all)
router.get('/', async (_req: Request, res: Response) => {
    const rows = await query(
        `SELECT pt.*, array_agg(s.canonical_name) as practiced_skills
     FROM project_templates pt
     LEFT JOIN project_skills ps ON pt.id = ps.project_id
     LEFT JOIN skills s ON ps.skill_id = s.id
     GROUP BY pt.id ORDER BY pt.difficulty`
    );
    return res.json(rows);
});

export default router;
