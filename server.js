import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Evita múltiplas conexões em desenvolvimento
const adapter = new PrismaPg({
  connectionString: globalThis.process.env.DATABASE_URL,
});

const prisma = globalThis.prisma || new PrismaClient({ adapter });
if (globalThis.process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

const DEFAULT_ADMIN_USER = globalThis.process.env.VITE_ADMIN_USER || 'admin';
const DEFAULT_ADMIN_PASSWORD = globalThis.process.env.VITE_ADMIN_PASSWORD || '123456';
const JWT_SECRET = globalThis.process.env.AUTH_JWT_SECRET || 'dev-only-change-me';
const AUTH_TOKEN_EXPIRES_IN = '12h';

const readActiveCredentials = async () => {
  const stored = await prisma.adminCredential.findUnique({
    where: { key: 'singleton' },
  });

  if (stored) {
    return {
      user: stored.username,
      mode: 'custom',
      comparePassword: async (plain) => bcrypt.compare(plain, stored.passwordHash),
    };
  }

  return {
    user: DEFAULT_ADMIN_USER,
    mode: 'default',
    comparePassword: async (plain) => plain === DEFAULT_ADMIN_PASSWORD,
  };
};

const createToken = (username) =>
  jwt.sign({ sub: 'admin', username }, JWT_SECRET, { expiresIn: AUTH_TOKEN_EXPIRES_IN });

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const token = authHeader.slice('Bearer '.length);
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

app.post('/api/auth/login', async (req, res) => {
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
});

app.put('/api/auth/credentials', requireAuth, async (req, res) => {
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

    if (newUser.trim().length < 3) {
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
        username: newUser.trim(),
        passwordHash,
      },
      create: {
        key: 'singleton',
        username: newUser.trim(),
        passwordHash,
      },
    });

    const token = createToken(saved.username);
    return res.status(200).json({
      message: 'Credenciais alteradas com sucesso.',
      token,
      username: saved.username,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar credenciais.' });
  }
});

app.get('/api/registros', async (req, res) => {
  try {
    const registros = await prisma.registroFrota.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(registros);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

app.post('/api/registros', requireAuth, async (req, res) => {
  try {
    const {
      nome,
      motorista,
      categoria,
      tipo,
      valor,
      litros,
      precoLitro,
      observacoes,
    } = req.body ?? {};

    const litrosNum = parseFloat(litros);
    const precoNum = parseFloat(precoLitro);
    const valorNum = parseFloat(valor);

    const novoRegistro = await prisma.registroFrota.create({
      data: {
        nome,
        motorista,
        categoria,
        tipo,
        valor: valorNum,
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
});

app.put('/api/registros', requireAuth, async (req, res) => {
  try {
    const {
      id,
      nome,
      motorista,
      categoria,
      tipo,
      valor,
      litros,
      precoLitro,
      observacoes,
    } = req.body ?? {};

    const litrosNum = parseFloat(litros);
    const precoNum = parseFloat(precoLitro);
    const valorNum = parseFloat(valor);

    const registroEditado = await prisma.registroFrota.update({
      where: { id },
      data: {
        nome,
        motorista,
        categoria,
        tipo,
        valor: valorNum,
        litros: litrosNum,
        precoLitro: precoNum,
        custo: litrosNum * precoNum,
        observacoes: observacoes ?? null,
      },
    });

    return res.status(200).json(registroEditado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao editar registro' });
  }
});

app.delete('/api/registros', requireAuth, async (req, res) => {
  try {
    const { idParaDeletar } = req.body ?? {};
    await prisma.registroFrota.delete({ where: { id: idParaDeletar } });
    return res.status(200).json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao excluir registro' });
  }
});

const PORT = parseInt(globalThis.process.env.PORT || '3001', 10);
app.listen(PORT, '127.0.0.1', () => {
  console.log(`API rodando em http://127.0.0.1:${PORT}`);
});

