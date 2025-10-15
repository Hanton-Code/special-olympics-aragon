import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env';

export function ensureUploadDir() {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

export function computeSha256(filePath: string) {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest('hex');
}

export function localPath(fileName: string) {
  return path.join(env.uploadDir, fileName);
}