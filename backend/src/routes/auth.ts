import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db/pool';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nexora_ai_super_secret_jwt_key_2026_dev_prod';

const RegisterSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

function signToken(id: string, email: string) {
    return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
    const parse = RegisterSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Validation failed', details: parse.error.flatten() });
    }
    const { name, email, password } = parse.data;
    try {
        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const password_hash = await bcrypt.hash(password, 12);
        const rows = await query<{ id: string; email: string }>(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
            [name, email, password_hash]
        );
        const user = rows[0];
        const token = signToken(user.id, user.email);
        return res.status(201).json({ token, user: { id: user.id, email: user.email, name } });
    } catch (err: any) {
        return res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    const parse = LoginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Validation failed', details: parse.error.flatten() });
    }
    const { email, password } = parse.data;
    try {
        const rows = await query<{ id: string; email: string; name: string; password_hash: string }>(
            'SELECT id, email, name, password_hash FROM users WHERE email = $1',
            [email]
        );
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        const token = signToken(user.id, user.email);
        return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch {
        return res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/logout (stateless — client just discards token)
router.post('/logout', (_req, res) => {
    res.json({ message: 'Logged out successfully' });
});

export default router;
