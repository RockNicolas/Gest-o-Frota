import bcrypt from 'bcryptjs';
import { readActiveCredentials } from './auth.js';

export async function createAppUser(prisma, { username, password, confirmPassword }) {
  if (!username || !password || !confirmPassword) {
    return { status: 400, body: { error: 'Preencha usuário, senha e confirmação.' } };
  }

  const clean = username.trim().toLowerCase();
  if (clean.length < 3) {
    return { status: 400, body: { error: 'O usuário deve ter pelo menos 3 caracteres.' } };
  }

  if (password.length < 4) {
    return { status: 400, body: { error: 'A senha deve ter pelo menos 4 caracteres.' } };
  }

  if (password !== confirmPassword) {
    return { status: 400, body: { error: 'A confirmação da senha não confere.' } };
  }

  const active = await readActiveCredentials();
  if (clean === active.user.trim().toLowerCase()) {
    return { status: 409, body: { error: 'Este nome já é usado pelo administrador do sistema.' } };
  }

  const exists = await prisma.user.findUnique({ where: { username: clean } });
  if (exists) {
    return { status: 409, body: { error: 'Já existe um usuário com este nome.' } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await prisma.user.create({
    data: {
      username: clean,
      passwordHash,
      role: 'user',
    },
  });

  return {
    status: 201,
    body: {
      message: 'Usuário criado com sucesso.',
      user: {
        id: created.id,
        username: created.username,
        role: created.role,
        createdAt: created.createdAt,
      },
    },
  };
}
