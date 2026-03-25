import bcrypt from 'bcryptjs';
import prisma from '../_lib/prisma.js';
import { createToken, readActiveCredentials } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { user, password } = req.body ?? {};
    if (!user || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const active = await readActiveCredentials();
    const isAdminUser =
      user.trim().toLowerCase() === active.user.trim().toLowerCase();
    const isAdminPassword = await active.comparePassword(password);

    if (isAdminUser && isAdminPassword) {
      const token = createToken({
        sub: 'admin',
        username: active.user,
        role: 'admin',
      });
      return res.status(200).json({
        token,
        username: active.user,
        mode: active.mode,
        role: 'admin',
      });
    }

    const normalized = user.trim().toLowerCase();
    const appUser = await prisma.user.findUnique({
      where: { username: normalized },
    });

    if (!appUser) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    const ok = await bcrypt.compare(password, appUser.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    const token = createToken({
      sub: appUser.id,
      username: appUser.username,
      role: appUser.role,
    });

    return res.status(200).json({
      token,
      username: appUser.username,
      mode: 'app_user',
      role: appUser.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao autenticar.' });
  }
}
