import prisma from './_lib/prisma.js';
import { getAuthPayload } from './_lib/auth.js';

export default async function handler(req, res) {
  const auth = getAuthPayload(req);

  // 1. BUSCAR TODOS OS REGISTROS (GET)
  if (req.method === 'GET') {
    try {
      const registros = await prisma.registroFrota.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(registros);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }
  }

  // 2. SALVAR NOVO REGISTRO (POST)
  if (req.method === 'POST') {
    if (!auth) return res.status(401).json({ error: 'Não autenticado.' });
    try {
      const {
        nome,
        motorista,
        categoria,
        tipo,
        periodo,
        valor,
        litros,
        precoLitro,
        observacoes,
      } = req.body;

      const litrosNum = parseFloat(litros);
      const precoNum = parseFloat(precoLitro);
      const periodoNormalizado = periodo === 'mensal' ? 'mensal' : 'semanal';

      const novoRegistro = await prisma.registroFrota.create({
        data: {
          nome,
          motorista,
          categoria,
          tipo,
          periodo: periodoNormalizado,
          valor: parseFloat(valor),
          litros: litrosNum,
          precoLitro: precoNum,
          custo: litrosNum * precoNum,
          observacoes: observacoes ?? null,
        },
      });
      return res.status(201).json(novoRegistro);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao salvar no banco' });
    }
  }

  // 3. EDITAR REGISTRO EXISTENTE (PUT)
  if (req.method === 'PUT') {
    if (!auth) return res.status(401).json({ error: 'Não autenticado.' });
    try {
      const data = req.body;
      const litrosNum = parseFloat(data.litros);
      const precoNum = parseFloat(data.precoLitro);
      const periodoNormalizado = data.periodo === 'mensal' ? 'mensal' : 'semanal';

      const registroEditado = await prisma.registroFrota.update({
        where: { id: data.id },
        data: {
          nome: data.nome,
          motorista: data.motorista,
          categoria: data.categoria,
          tipo: data.tipo,
          periodo: periodoNormalizado,
          valor: parseFloat(data.valor),
          litros: litrosNum,
          precoLitro: precoNum,
          custo: litrosNum * precoNum,
          observacoes: data.observacoes ?? null,
        },
      });
      return res.status(200).json(registroEditado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao editar registro' });
    }
  }

  // 4. EXCLUIR REGISTRO (DELETE)
  if (req.method === 'DELETE') {
    if (!auth) return res.status(401).json({ error: 'Não autenticado.' });
    try {
      const { idParaDeletar } = req.body;
      await prisma.registroFrota.delete({
        where: { id: idParaDeletar },
      });
      return res.status(200).json({ message: 'Registro excluído com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao excluir registro' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
