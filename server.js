import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAppUser } from './pages/api/_lib/createAppUser.js';
import { isSignupEnabled, isSignupSecretValid } from './pages/api/_lib/signupSecret.js';

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

const createToken = ({ sub, username, role }) =>
  jwt.sign({ sub, username, role }, JWT_SECRET, { expiresIn: AUTH_TOKEN_EXPIRES_IN });

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const token = authHeader.slice('Bearer '.length);
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload.role) payload.role = 'admin';
    req.auth = payload;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

const isAdminAuth = (auth) => auth && auth.role === 'admin';

app.post('/api/auth/login', async (req, res) => {
  try {
    const { user, password } = req.body ?? {};
    if (!user || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const active = await readActiveCredentials();
    const isAdminUser =
      user.trim().toLowerCase() === active.user.trim().toLowerCase();
    const isAdminPassword = await active.comparePassword(password);

    if (isAdminUser && isAdminPassword) {
      const token = createToken({
        sub: 'admin',
        username: active.user,
        role: 'admin',
      });
      return res.status(200).json({
        token,
        username: active.user,
        mode: active.mode,
        role: 'admin',
      });
    }

    const normalized = user.trim().toLowerCase();
    const appUser = await prisma.user.findUnique({
      where: { username: normalized },
    });

    if (!appUser) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    const ok = await bcrypt.compare(password, appUser.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    const token = createToken({
      sub: appUser.id,
      username: appUser.username,
      role: appUser.role,
    });

    return res.status(200).json({
      token,
      username: appUser.username,
      mode: 'app_user',
      role: appUser.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao autenticar.' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  if (!isSignupEnabled()) {
    return res.status(403).json({
      error:
        'Cadastro por código não está habilitado. Configure SIGNUP_SECRET no servidor ou peça acesso ao administrador.',
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
});

app.put('/api/auth/credentials', requireAuth, async (req, res) => {
  if (!isAdminAuth(req.auth)) {
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
});

app.post('/api/auth/register', requireAuth, async (req, res) => {
  if (!isAdminAuth(req.auth)) {
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
});

app.get('/api/users', requireAuth, async (req, res) => {
  if (!isAdminAuth(req.auth)) {
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

// Rotas de Snapshots (Cadastros Salvos) — leitura pública (como /api/registros); gravar/excluir exige login
app.get('/api/snapshots', async (req, res) => {
  try {
    const snapshots = await prisma.snapshot.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(snapshots);
  } catch (error) {
    console.error('Erro ao buscar snapshots:', error);
    return res.status(500).json({ error: 'Erro ao buscar cadastros salvos.' });
  }
});

app.post('/api/snapshots', requireAuth, async (req, res) => {
  console.log('POST /api/snapshots - req.auth:', req.auth);
  console.log('POST /api/snapshots - body:', req.body);
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
});

app.delete('/api/snapshots', requireAuth, async (req, res) => {
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
});

const PORT = parseInt(globalThis.process.env.PORT || '3001', 10);
app.listen(PORT, '127.0.0.1', () => {
  console.log(`API rodando em http://127.0.0.1:${PORT}`);
});

