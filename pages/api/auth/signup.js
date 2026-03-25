import prisma from '../_lib/prisma.js';
import { createAppUser } from '../_lib/createAppUser.js';
import { isSignupEnabled, isSignupSecretValid } from '../_lib/signupSecret.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!isSignupEnabled()) {
    return res.status(403).json({
      error: 'Cadastro por código não está habilitado. Configure SIGNUP_SECRET no servidor ou peça acesso ao administrador.',
    });
  }

  try {
    const { signupSecret, username, password, confirmPassword } = req.body ?? {};
    if (!signupSecret || !String(signupSecret).trim()) {
      return res.status(400).json({ error: 'Informe o código de cadastro.' });
    }

    if (!isSignupSecretValid(signupSecret, globalThis.process.env.SIGNUP_SECRET)) {
      return res.status(401).json({ error: 'Código de cadastro inválido.' });
    }

    const result = await createAppUser(prisma, { username, password, confirmPassword });
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
}
