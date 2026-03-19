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
    const isUserValid = user.trim().toLowerCase() === active.user.trim().toLowerCase();
    const isPasswordValid = await active.comparePassword(password);

    if (!isUserValid || !isPasswordValid) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    const token = createToken(active.user);
    return res.status(200).json({
      token,
      username: active.user,
      mode: active.mode,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao autenticar.' });
  }
}

