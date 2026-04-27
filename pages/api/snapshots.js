import prisma from './_lib/prisma.js';
import { getAuthPayload } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const snapshots = await prisma.snapshot.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(snapshots);
    } catch (error) {
      console.error('Erro ao buscar snapshots:', error);
      return res.status(500).json({ error: 'Erro ao buscar cadastros salvos.' });
    }
  }

  const auth = getAuthPayload(req);
  if (!auth) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  if (req.method === 'POST') {
    const { title, periodo, registros } = req.body;
    const periodoNormalizado = periodo === 'mensal' ? 'mensal' : 'semanal';
    if (!title || !registros || !Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ error: 'Título e registros são obrigatórios.' });
    }

    try {
      const novoSnapshot = await prisma.snapshot.create({
        data: {
          title,
          periodo: periodoNormalizado,
          registros,
        },
      });
      return res.status(201).json(novoSnapshot);
    } catch (error) {
      console.error('Erro ao criar snapshot:', error);
      return res.status(500).json({ error: 'Erro ao salvar cadastro no banco.' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID do snapshot é obrigatório.' });
    }

    try {
      await prisma.snapshot.delete({ where: { id } });
      return res.status(200).json({ message: 'Cadastro salvo excluído.' });
    } catch (error) {
      console.error('Erro ao excluir snapshot:', error);
      return res.status(500).json({ error: 'Erro ao excluir cadastro salvo.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: `Método ${req.method} não permitido.` });
}
