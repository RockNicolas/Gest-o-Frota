import { PrismaClient } from '@prisma/client';

// Evita criar múltiplas conexões em desenvolvimento
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  const { id } = req.query; // Pega o ID da URL para Delete/Put

  // 1. BUSCAR TODOS OS REGISTROS (GET)
  if (req.method === 'GET') {
    try {
      const registros = await prisma.registro.findMany({
        orderBy: { dataCriacao: 'desc' },
      });
      return res.status(200).json(registros);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar dados" });
    }
  }

  // 2. SALVAR NOVO REGISTRO (POST)
  if (req.method === 'POST') {
    try {
      const { nome, motorista, categoria, tipo, valor, litros, precoLitro, observacoes } = req.body;
      const novoRegistro = await prisma.registro.create({
        data: {
          prefixo: nome,
          motorista: motorista,
          categoria: categoria,
          tipoComb: tipo,
          usoValor: parseFloat(valor),
          litros: parseFloat(litros),
          precoLitro: parseFloat(precoLitro),
          custoTotal: parseFloat(litros) * parseFloat(precoLitro),
          observacoes: observacoes,
        },
      });
      return res.status(201).json(novoRegistro);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao salvar no banco" });
    }
  }

  // 3. EDITAR REGISTRO EXISTENTE (PUT)
  if (req.method === 'PUT') {
    try {
      const data = req.body;
      const registroEditado = await prisma.registro.update({
        where: { id: data.id },
        data: {
          prefixo: data.nome || data.prefixo,
          motorista: data.motorista,
          usoValor: parseFloat(data.valor || data.usoValor),
          litros: parseFloat(data.litros),
          precoLitro: parseFloat(data.precoLitro),
          custoTotal: parseFloat(data.litros) * parseFloat(data.precoLitro),
          observacoes: data.observacoes,
        },
      });
      return res.status(200).json(registroEditado);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao editar registro" });
    }
  }

  // 4. EXCLUIR REGISTRO (DELETE)
  if (req.method === 'DELETE') {
    try {
      const { idParaDeletar } = req.body; // Recebe o ID pelo corpo da requisição
      await prisma.registro.delete({
        where: { id: idParaDeletar },
      });
      return res.status(200).json({ message: "Registro excluído com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao excluir registro" });
    }
  }
}