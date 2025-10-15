import dotenv from 'dotenv';

dotenv.config();

const required = (key: string, fallback?: string)=>{
    const value = process.env[key] ?? fallback;
    if(!value) 
        throw new Error(`Missing env: ${key}`);
    return value;
}

export const env = {
    port: Number(process.env.PORT ?? 3000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    jwtSecret: required('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    databaseUrl: required('DATABASE_URL'),
    uploadDir: required('UPLOAD_DIR', './uploads'),
    maxPdfMB: Number(process.env.MAX_PDF_MB ?? 10),
    allowOrigins: (process.env.ALLOW_ORIGINS ?? '').split(',').filter(Boolean)
};