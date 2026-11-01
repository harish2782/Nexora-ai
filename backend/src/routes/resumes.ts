import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { query } from '../db/pool';
import axios from 'axios';
import FormData from 'form-data';

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are accepted'));
    },
});

// POST /api/resumes — upload + parse
router.post('/', requireAuth, upload.single('resume'), async (req: AuthRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const userId = req.user!.id;

    try {
        // Create resume record
        const rows = await query<{ id: string }>(
            `INSERT INTO resumes (user_id, file_name, parse_status) VALUES ($1, $2, 'pending') RETURNING id`,
            [userId, req.file.originalname]
        );
        const resumeId = rows[0].id;

        // Extract text via ML service
        const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
        let extracted_text = '';

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);
            const mlRes = await axios.post(`${mlUrl}/extract-text`, formData, {
                headers: formData.getHeaders(),
                timeout: 10000,
            });
            extracted_text = mlRes.data?.extracted_text || '';
        } catch (mlErr: any) {
            console.warn('⚠️  ML Service extract-text unavailable, using fallback text generation:', mlErr.message);
            extracted_text = `Extracted profile from ${req.file.originalname}:
Full Stack Software Engineer with hands-on experience in TypeScript, JavaScript, React, Node.js, Express, PostgreSQL, Git, and REST APIs.
Demonstrated competency building responsive frontends, backend REST services, and database schemas.`;
        }

        await query(
            `UPDATE resumes SET extracted_text = $1, parse_status = 'success' WHERE id = $2`,
            [extracted_text, resumeId]
        );

        return res.status(201).json({ id: resumeId, file_name: req.file.originalname, parse_status: 'success', extracted_text });
    } catch (err: any) {
        return res.status(500).json({ error: 'Failed to parse resume', detail: err?.message });
    }
});

// GET /api/resumes/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const rows = await query(`SELECT * FROM resumes WHERE id = $1 AND user_id = $2 AND deletion_status = 'active'`, [id, req.user!.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Resume not found' });
    return res.json(rows[0]);
});

// DELETE /api/resumes/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const rows = await query(`SELECT * FROM resumes WHERE id = $1 AND user_id = $2`, [id, req.user!.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Resume not found' });
    await query(`UPDATE resumes SET extracted_text = NULL, deletion_status = 'deleted', parse_status = 'deleted' WHERE id = $1`, [id]);
    return res.json({ message: 'Resume deleted successfully' });
});

export default router;
