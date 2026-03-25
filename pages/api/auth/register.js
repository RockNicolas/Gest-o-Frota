import prisma from '../_lib/prisma.js';
import { getAuthPayload, isAdminAuth } from '../_lib/auth.js';
import { createAppUser } from '../_lib/createAppUser.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const auth = getAuthPayload(req);
  if (!isAdminAuth(auth)) {
    return res.status(403).json({ error: 'Apenas o administrador pode cadastrar novos usuários.' });
  }

  try {
    const { username, password, confirmPassword } = req.body ?? {};
    const result = await createAppUser(prisma, { username, password, confirmPassword });
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
}
