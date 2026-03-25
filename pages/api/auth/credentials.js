import bcrypt from 'bcryptjs';
import prisma from '../_lib/prisma.js';
import { createToken, getAuthPayload, isAdminAuth, readActiveCredentials } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const auth = getAuthPayload(req);
  if (!isAdminAuth(auth)) {
    return res.status(403).json({ error: 'Apenas o administrador pode alterar estas credenciais.' });
  }

  try {
    const {
      currentUser,
      currentPassword,
      newUser,
      newPassword,
      confirmNewPassword,
    } = req.body ?? {};

    if (!currentUser || !currentPassword || !newUser || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const active = await readActiveCredentials();
    const isCurrentUserValid = currentUser.trim().toLowerCase() === active.user.trim().toLowerCase();
    const isCurrentPasswordValid = await active.comparePassword(currentPassword);
    if (!isCurrentUserValid || !isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Credenciais atuais incorretas.' });
    }

    const cleanNewUser = newUser.trim();
    if (cleanNewUser.length < 3) {
      return res.status(400).json({ error: 'O novo usuário deve ter pelo menos 3 caracteres.' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 4 caracteres.' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'A confirmação da nova senha não confere.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const saved = await prisma.adminCredential.upsert({
      where: { key: 'singleton' },
      update: {
        username: cleanNewUser,
        passwordHash,
      },
      create: {
        key: 'singleton',
        username: cleanNewUser,
        passwordHash,
      },
    });

    const token = createToken({
      sub: 'admin',
      username: saved.username,
      role: 'admin',
    });
    return res.status(200).json({
      message: 'Credenciais alteradas com sucesso.',
      token,
      username: saved.username,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar credenciais.' });
  }
}

