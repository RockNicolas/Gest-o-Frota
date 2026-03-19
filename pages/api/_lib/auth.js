import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma.js';

const DEFAULT_ADMIN_USER = globalThis.process.env.VITE_ADMIN_USER || 'admin';
const DEFAULT_ADMIN_PASSWORD = globalThis.process.env.VITE_ADMIN_PASSWORD || '123456';
const JWT_SECRET = globalThis.process.env.AUTH_JWT_SECRET || 'dev-only-change-me';
const AUTH_TOKEN_EXPIRES_IN = '12h';

export const readActiveCredentials = async () => {
  const stored = await prisma.adminCredential.findUnique({
    where: { key: 'singleton' },
  });

  if (stored) {
    return {
      user: stored.username,
      mode: 'custom',
      comparePassword: async (plain) => bcrypt.compare(plain, stored.passwordHash),
    };
  }

  return {
    user: DEFAULT_ADMIN_USER,
    mode: 'default',
    comparePassword: async (plain) => plain === DEFAULT_ADMIN_PASSWORD,
  };
};

export const createToken = (username) =>
  jwt.sign({ sub: 'admin', username }, JWT_SECRET, { expiresIn: AUTH_TOKEN_EXPIRES_IN });

export const getAuthPayload = (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

