// Pure token signing/verification helpers.
// No DB access here — persisting/looking up refresh tokens is the
// job of repositories/token.repository.js (Phase 4).

import jwt from 'jsonwebtoken';
import { env } from './env.js';

export const generateAccessToken = (payload) =>
  jwt.sign({ ...payload, type: 'access' }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

export const generateRefreshToken = (payload) =>
  jwt.sign({ ...payload, type: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.secret);

export const verifyRefreshTokenSignature = (token) =>
  jwt.verify(token, env.jwt.refreshSecret);