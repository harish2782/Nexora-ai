import { Router, Response, Request } from 'express';
import { query } from '../db/pool';

const router = Router();

// GET /api/roles
router.get('/', async (req: Request, res: Response) => {
    const q = req.query.q as string || '';
    const rows = await query(
        `SELECT id, title, description, source_note, last_reviewed_at FROM role_profiles
     WHERE title ILIKE $1 OR $1 = '' ORDER BY title`,
        [`%${q}%`]
    );
    return res.json(rows);
});

// GET /api/roles/:id — with required + preferred skills
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const roleRows = await query(`SELECT * FROM role_profiles WHERE id=$1`, [id]);
    if (!roleRows.length) return res.status(404).json({ error: 'Role not found' });
    const skills = await query(
        `SELECT s.id, s.canonical_name, s.category, rs.importance
     FROM role_skills rs JOIN skills s ON rs.skill_id = s.id
     WHERE rs.role_profile_id=$1 ORDER BY rs.importance, s.canonical_name`,
        [id]
    );
    return res.json({ ...roleRows[0], skills });
});

export default router;
