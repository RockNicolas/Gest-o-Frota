import prisma from './_lib/prisma.js';
import { getAuthPayload, isAdminAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const auth = getAuthPayload(req);
  if (!isAdminAuth(auth)) {
    return res.status(403).json({ error: 'Apenas o administrador pode listar usuários.' });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
}
