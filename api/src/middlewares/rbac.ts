import { Request, Response, NextFunction } from 'express';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles ?? [];
    const allowed = roles.some(r => userRoles.includes(r));
    if (!allowed) 
        return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}