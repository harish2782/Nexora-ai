import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

const JWT_SECRET = process.env.JWT_SECRET || 'nexora_ai_super_secret_jwt_key_2026_dev_prod';

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
