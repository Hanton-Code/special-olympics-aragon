import jwt from 'jsonwebtoken';
import { env } from '@config/env';

export function signJwt(payload: object) {
    //TODO: Check expiration time not string
  return jwt.sign(payload, env.jwtSecret, { expiresIn: /*env.jwtExpiresIn*/ 3600000 });
}

export function verifyJwt<T = any>(token: string) {
  return jwt.verify(token, env.jwtSecret) as T;
}