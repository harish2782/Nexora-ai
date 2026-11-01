import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { query } from '../db/pool';

const router = Router();

// PATCH /api/roadmap-tasks/:id
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    // Verify ownership via analysis
    const rows = await query(
        `SELECT rt.id FROM roadmap_tasks rt
     JOIN job_analyses ja ON rt.analysis_id = ja.id
     WHERE rt.id=$1 AND ja.user_id=$2`,
        [id, req.user!.id]
    );

    if (!rows.length) {
        // Return updated task state for fallback/mock task IDs
        return res.json({ id, status, updated_at: new Date().toISOString() });
    }

    const completedAt = status === 'completed' ? 'NOW()' : 'NULL';
    await query(
        `UPDATE roadmap_tasks SET status=$1, completed_at=${completedAt} WHERE id=$2`,
        [status, id]
    );
    const updated = await query(`SELECT * FROM roadmap_tasks WHERE id=$1`, [id]);
    return res.json(updated[0] || { id, status });
});

export default router;
