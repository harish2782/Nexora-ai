import { Router, Response, Request } from 'express';
import { query } from '../db/pool';

const router = Router();

// GET /api/skills?q=...
router.get('/', async (req: Request, res: Response) => {
    const q = req.query.q as string || '';
    const rows = await query(
        `SELECT id, canonical_name, category, description FROM skills
     WHERE canonical_name ILIKE $1 OR $1 = '' ORDER BY canonical_name LIMIT 50`,
        [`%${q}%`]
    );
    return res.json(rows);
});

// GET /api/skills/graph
router.get('/graph', async (_req: Request, res: Response) => {
    const nodes = await query(`SELECT id, canonical_name, category, description FROM skills`);
    const edges = await query(
        `SELECT se.source_skill_id, se.target_skill_id, se.relationship_type, se.rationale,
            s1.canonical_name as source_name, s2.canonical_name as target_name
     FROM skill_edges se
     JOIN skills s1 ON se.source_skill_id = s1.id
     JOIN skills s2 ON se.target_skill_id = s2.id`
    );
    return res.json({ nodes, edges });
});

export default router;
