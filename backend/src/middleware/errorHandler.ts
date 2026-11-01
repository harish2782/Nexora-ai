import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    console.error('[ERROR]', err?.message || err);
    const status = err?.status || err?.statusCode || 500;
    res.status(status).json({
        error: err?.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err?.stack }),
    });
}

export function createError(status: number, message: string) {
    const err: any = new Error(message);
    err.status = status;
    return err;
}
