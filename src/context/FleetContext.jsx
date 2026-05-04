import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  readRoleFromToken,
  parseNumeroEntrada,
  extrairLitrosCalculoMeta,
  extrairTanqueImagemMeta,
  removerLitrosCalculoMeta,
  montarObservacoesComMeta,
  calcularMediaCategoria,
  normalizarPeriodoUrl,
} from '../utils/frotaCalculations.js';

const FleetContext = createContext(null);

const ADMIN_AUTH_TOKEN_KEY = 'admin_auth_token';
const AUTH_ROLE_KEY = 'auth_role';

export function FleetProvider({ children }) {
  const navigate = useNavigate();

  const API_URL_PRIMARY = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:3001');
  const API_URL_FALLBACK = import.meta.env.PROD ? '' : 'http://127.0.0.1:3001';

  const apiFetch = async (endpoint, options = {}) => {
    const { skipAuth, ...fetchOptions } = options;
    const token = skipAuth ? null : localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
    const headers = {
      ...(fetchOptions.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const requestOptions = { ...fetchOptions, headers };

    try {
      return await fetch(`${API_URL_PRIMARY}${endpoint}`, requestOptions);
    } catch {
      if (!API_URL_FALLBACK) throw new Error('Falha de conexão com a API');
      return await fetch(`${API_URL_FALLBACK}${endpoint}`, requestOptions);
    }
  };

  const [registros, setRegistros] = useState(() => {
    const salvo = localStorage.getItem('registros_montecristo');
    return salvo ? JSON.parse(salvo) : [];
  });
  const [savedSnapshots, setSavedSnapshots] = useState([]);
  const [snapshotTitle, setSnapshotTitle] = useState('');
  const [snapshotFeedback, setSnapshotFeedback] = useState('');
  const [loadedSnapshotTitle, setLoadedSnapshotTitle] = useState('');
  const [previousRegistros, setPreviousRegistros] = useState(null);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem(ADMIN_AUTH_TOKEN_KEY));
  const [authRole, setAuthRole] = useState(() => {
    const token = localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
    const fromJwt = readRoleFromToken(token);
    if (fromJwt) return fromJwt;
    return localStorage.getItem(AUTH_ROLE_KEY) || 'admin';
  });
  const [login, setLogin] = useState({ user: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAdminAccessArea, setShowAdminAccessArea] = useState(false);
  const [adminUsername, setAdminUsername] = useState(() => localStorage.getItem('admin_username') || '');
  const [modoBarra, setModoBarra] = useState('valor');
  const [periodo, setPeriodo] = useState('semanal');
  const [credentialsForm, setCredentialsForm] = useState({
    usuarioAtual: '',
    novoUsuario: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarNovaSenha: '',
  });
  const [credentialsFeedback, setCredentialsFeedback] = useState({ erro: '', sucesso: '' });
  const [novoUsuarioForm, setNovoUsuarioForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [novoUsuarioFeedback, setNovoUsuarioFeedback] = useState({ erro: '', sucesso: '' });
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cadastroPublicoForm, setCadastroPublicoForm] = useState({
    signupSecret: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [cadastroPublicoFeedback, setCadastroPublicoFeedback] = useState({ erro: '', sucesso: '' });
  const [showSignupSecret, setShowSignupSecret] = useState(false);
  const [clientCadastrosOpen, setClientCadastrosOpen] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    motorista: '',
    tipo: 'Diesel',
    categoria: 'Máquina',
    periodo: 'semanal',
    valor: 0,
    valorAnterior: '',
    litros: 0,
    litrosAnterior: '',
    tanqueAntesImagem: '',
    custoTotal: 0,
    observacoes: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiFetch('/api/registros');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        setRegistros(data);
      } catch (e) {
        console.error('Falha ao buscar registros do banco:', e);
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('registros_montecristo', JSON.stringify(registros));
  }, [registros]);

  const carregarUsuarios = async () => {
    if (authRole !== 'admin') return;
    try {
      const resp = await apiFetch('/api/users');
      if (!resp.ok) return;
      const data = await resp.json();
      setListaUsuarios(data);
    } catch (e) {
      console.error('Erro ao listar usuários:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated && authRole === 'admin') {
      carregarUsuarios();
      carregarSnapshots();
    }
  }, [isAuthenticated, authRole]);

  const carregarSnapshots = async () => {
    try {
      const resp = await apiFetch('/api/snapshots');
      if (!resp.ok) return;
      const data = await resp.json();
      setSavedSnapshots(data);
    } catch (e) {
      console.error('Erro ao carregar snapshots:', e);
    }
  };

  const registrosFiltrados = useMemo(
    () => registros.filter((registro) => (registro.periodo || 'semanal') === periodo),
    [registros, periodo]
  );

  const snapshotsFiltradosPorPeriodo = useMemo(
    () => savedSnapshots.filter((snapshot) => (snapshot.periodo || 'semanal') === periodo),
    [savedSnapshots, periodo]
  );

  const totalGeral = useMemo(
    () => registrosFiltrados.reduce((acc, curr) => acc + Number(curr.custo || 0), 0),
    [registrosFiltrados]
  );
  const totalLiters = useMemo(
    () => registrosFiltrados.reduce((acc, curr) => acc + Number(curr.litros || 0), 0),
    [registrosFiltrados]
  );
  const litrosDiesel = useMemo(
    () => registrosFiltrados.filter((r) => r.tipo === 'Diesel').reduce((a, b) => a + Number(b.litros || 0), 0),
    [registrosFiltrados]
  );
  const litrosGasolina = useMemo(
    () => registrosFiltrados.filter((r) => r.tipo === 'Gasolina').reduce((a, b) => a + Number(b.litros || 0), 0),
    [registrosFiltrados]
  );
  const custoDiesel = useMemo(
    () => registrosFiltrados.filter((r) => r.tipo === 'Diesel').reduce((a, b) => a + Number(b.custo || 0), 0),
    [registrosFiltrados]
  );
  const custoGasolina = useMemo(
    () => registrosFiltrados.filter((r) => r.tipo === 'Gasolina').reduce((a, b) => a + Number(b.custo || 0), 0),
    [registrosFiltrados]
  );
  const percDiesel = totalLiters ? (litrosDiesel / totalLiters) * 100 : 50;
  const mediasCategoria = useMemo(
    () => [
      calcularMediaCategoria(registrosFiltrados, 'Máquina', 'Retro / Máquinas', periodo),
      calcularMediaCategoria(registrosFiltrados, 'Caminhão', 'Caminhões', periodo),
      calcularMediaCategoria(registrosFiltrados, 'Veículo', 'Veículos', periodo),
    ],
    [registrosFiltrados, periodo]
  );

  const formatarMoedaBR = useCallback(
    (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    []
  );

  const syncPeriodoFromUrl = useCallback((urlPeriodo) => {
    const p = normalizarPeriodoUrl(urlPeriodo);
    setPeriodo(p);
    setForm((prev) => ({ ...prev, periodo: p }));
  }, []);

  const adicionar = async (e) => {
    e.preventDefault();
    try {
      const valorAtualNum = parseNumeroEntrada(form.valor, form.categoria);
      const valorAnteriorNum = parseNumeroEntrada(form.valorAnterior, form.categoria);
      const litrosPrimeiroNum = parseNumeroEntrada(form.litrosAnterior, form.categoria);
      const litrosTotalNum = parseNumeroEntrada(form.litros, form.categoria);
      const isMensal = form.periodo === 'mensal';

      const temDeltaValido =
        Number.isFinite(valorAtualNum) &&
        Number.isFinite(valorAnteriorNum) &&
        valorAtualNum > valorAnteriorNum;

      const valorParaSalvar = temDeltaValido ? valorAtualNum - valorAnteriorNum : valorAtualNum;
      const litrosParaSalvar = litrosTotalNum;
      const custoTotalNum = parseNumeroEntrada(form.custoTotal, form.categoria);
      const precoLitroParaSalvar = litrosParaSalvar > 0 ? custoTotalNum / litrosParaSalvar : 0;
      const litrosMetaObservacao = isMensal ? null : litrosPrimeiroNum;
      const observacoesComMeta = montarObservacoesComMeta(
        form.observacoes,
        litrosMetaObservacao,
        isMensal ? '' : form.tanqueAntesImagem
      );

      const resp = await apiFetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tanqueAntesImagem: isMensal ? '' : form.tanqueAntesImagem,
          valor: valorParaSalvar,
          litros: litrosParaSalvar,
          precoLitro: precoLitroParaSalvar,
          observacoes: observacoesComMeta,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const novoRegistro = await resp.json();
      setRegistros((prev) => [...prev, novoRegistro]);
      setForm({
        ...form,
        nome: '',
        motorista: '',
        valor: 0,
        valorAnterior: '',
        litros: 0,
        litrosAnterior: '',
        tanqueAntesImagem: '',
        custoTotal: 0,
        observacoes: '',
      });
    } catch (err) {
      console.error('Erro ao salvar no banco:', err);
    }
  };

  const remover = async (id) => {
    try {
      const resp = await apiFetch('/api/registros', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idParaDeletar: id }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setRegistros((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Erro ao excluir no banco:', e);
    }
  };

  const saveSnapshot = async () => {
    if (!snapshotTitle.trim()) {
      setSnapshotFeedback('Digite um título antes de salvar.');
      return;
    }
    if (!registrosFiltrados || registrosFiltrados.length === 0) {
      setSnapshotFeedback(`Não há registros ${periodo === 'semanal' ? 'semanais' : 'mensais'} para salvar.`);
      return;
    }
    try {
      const resp = await apiFetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: snapshotTitle.trim(),
          periodo,
          registros: registrosFiltrados,
        }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${resp.status}`);
      }
      const novoSnapshot = await resp.json();
      setSavedSnapshots((prev) => [novoSnapshot, ...prev]);
      setSnapshotTitle('');
      setSnapshotFeedback(`Cadastro ${periodo === 'semanal' ? 'semanal' : 'mensal'} salvo com sucesso.`);
    } catch (e) {
      console.error('Erro ao salvar snapshot:', e);
      setSnapshotFeedback(`Erro: ${e.message}`);
    }
  };

  const loadSnapshot = (snapshot, opts = {}) => {
    if (!snapshot || !snapshot.registros) return;
    setPreviousRegistros(registros);
    setRegistros(snapshot.registros);
    const snapPeriodo = snapshot.periodo || 'semanal';
    setPeriodo(snapPeriodo);
    setForm((prev) => ({ ...prev, periodo: snapPeriodo }));
    setLoadedSnapshotTitle(snapshot.title);
    setSnapshotFeedback(`Cadastro "${snapshot.title}" carregado.`);
    if (!opts.skipAdminTab) {
      navigate(`/admin/cadastro/${snapPeriodo}`);
    }
  };

  const exitLoadedSnapshot = (opts = {}) => {
    if (previousRegistros) {
      setRegistros(previousRegistros);
    }
    setLoadedSnapshotTitle('');
    setPreviousRegistros(null);
    setSnapshotFeedback('Saindo do cadastro carregado.');
    if (!opts.skipAdminTab) {
      navigate(`/admin/salvos/${periodo}`);
    }
  };

  const removeSnapshot = async (id) => {
    try {
      const resp = await apiFetch('/api/snapshots', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setSavedSnapshots((prev) => prev.filter((snapshot) => snapshot.id !== id));
    } catch (e) {
      console.error('Erro ao excluir snapshot:', e);
      setSnapshotFeedback('Erro ao excluir do banco de dados.');
    }
  };

  const abrirEdicao = (item) => {
    setItemEditando({
      ...item,
      litrosCalculo: extrairLitrosCalculoMeta(item.observacoes) ?? Number(item.litros || 0),
      tanqueAntesImagem: extrairTanqueImagemMeta(item.observacoes),
      observacoes: removerLitrosCalculoMeta(item.observacoes),
    });
    setIsModalOpen(true);
  };

  const salvarEdicao = async () => {
    if (!itemEditando) return;
    try {
      const litrosNum = Number(itemEditando.litros);
      const custoNum = Number(itemEditando.custo);
      const precoLitroCalculado = litrosNum > 0 ? custoNum / litrosNum : 0;
      const edicaoMensal = itemEditando.periodo === 'mensal';
      const observacoesComMeta = montarObservacoesComMeta(
        itemEditando.observacoes,
        edicaoMensal ? null : itemEditando.litrosCalculo,
        edicaoMensal ? '' : itemEditando.tanqueAntesImagem
      );

      const resp = await apiFetch('/api/registros', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemEditando,
          tanqueAntesImagem: edicaoMensal ? '' : itemEditando.tanqueAntesImagem,
          periodo: edicaoMensal ? 'mensal' : 'semanal',
          valor: Number(itemEditando.valor),
          litros: litrosNum,
          precoLitro: precoLitroCalculado,
          observacoes: observacoesComMeta,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const registroAtualizado = await resp.json();
      setRegistros((prev) => prev.map((r) => (r.id === registroAtualizado.id ? registroAtualizado : r)));
      setIsModalOpen(false);
    } catch (e) {
      console.error('Erro ao editar no banco:', e);
    }
  };

  const autenticar = async (e) => {
    e.preventDefault();
    try {
      const resp = await apiFetch('/api/auth/login', {
        method: 'POST',
        skipAuth: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: login.user,
          password: login.password,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      localStorage.setItem(ADMIN_AUTH_TOKEN_KEY, data.token);
      localStorage.setItem('admin_username', data.username);
      const role = data.role || 'admin';
      localStorage.setItem(AUTH_ROLE_KEY, role);
      setAuthRole(role);
      setAdminUsername(data.username);
      setIsAuthenticated(true);
      setLoginError('');
    } catch (err) {
      setLoginError(err.message || 'Falha ao autenticar.');
    }
  };

  const sairPainel = () => {
    localStorage.removeItem(ADMIN_AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
    setAuthRole('admin');
    setIsAuthenticated(false);
    setIsUserMenuOpen(false);
    setShowAdminAccessArea(false);
    setIsModalOpen(false);
    setItemEditando(null);
    setListaUsuarios([]);
  };

  const abrirPainelAcesso = () => {
    setShowAdminAccessArea(true);
    setIsUserMenuOpen(false);
  };

  const alterarCredenciais = async (e) => {
    e.preventDefault();
    try {
      const resp = await apiFetch('/api/auth/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUser: credentialsForm.usuarioAtual,
          currentPassword: credentialsForm.senhaAtual,
          newUser: credentialsForm.novoUsuario,
          newPassword: credentialsForm.novaSenha,
          confirmNewPassword: credentialsForm.confirmarNovaSenha,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }

      localStorage.setItem(ADMIN_AUTH_TOKEN_KEY, data.token);
      localStorage.setItem('admin_username', data.username);
      localStorage.setItem(AUTH_ROLE_KEY, 'admin');
      setAuthRole('admin');
      setAdminUsername(data.username);
      setCredentialsForm({
        usuarioAtual: '',
        novoUsuario: '',
        senhaAtual: '',
        novaSenha: '',
        confirmarNovaSenha: '',
      });
      setCredentialsFeedback({ erro: '', sucesso: data.message || 'Credenciais atualizadas com sucesso.' });
    } catch (err) {
      setCredentialsFeedback({ erro: err.message || 'Falha ao atualizar credenciais.', sucesso: '' });
    }
  };

  const cadastrarNovoUsuario = async (e) => {
    e.preventDefault();
    try {
      const resp = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: novoUsuarioForm.username,
          password: novoUsuarioForm.password,
          confirmPassword: novoUsuarioForm.confirmPassword,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }
      setNovoUsuarioForm({ username: '', password: '', confirmPassword: '' });
      setNovoUsuarioFeedback({ erro: '', sucesso: data.message || 'Usuário criado.' });
      await carregarUsuarios();
    } catch (err) {
      setNovoUsuarioFeedback({ erro: err.message || 'Falha ao cadastrar.', sucesso: '' });
    }
  };

  const cadastroPublico = async (e) => {
    e.preventDefault();
    setCadastroPublicoFeedback({ erro: '', sucesso: '' });
    try {
      const resp = await apiFetch('/api/auth/signup', {
        method: 'POST',
        skipAuth: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signupSecret: cadastroPublicoForm.signupSecret,
          username: cadastroPublicoForm.username,
          password: cadastroPublicoForm.password,
          confirmPassword: cadastroPublicoForm.confirmPassword,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }
      setCadastroPublicoForm({
        signupSecret: '',
        username: '',
        password: '',
        confirmPassword: '',
      });
      setCadastroPublicoFeedback({
        erro: '',
        sucesso: data.message || 'Conta criada. Agora você pode entrar com seu usuário e senha.',
      });
    } catch (err) {
      setCadastroPublicoFeedback({ erro: err.message || 'Falha ao cadastrar.', sucesso: '' });
    }
  };

  const value = {
    ADMIN_AUTH_TOKEN_KEY,
    AUTH_ROLE_KEY,
    apiFetch,
    registros,
    setRegistros,
    savedSnapshots,
    setSavedSnapshots,
    snapshotTitle,
    setSnapshotTitle,
    snapshotFeedback,
    setSnapshotFeedback,
    loadedSnapshotTitle,
    setLoadedSnapshotTitle,
    previousRegistros,
    setPreviousRegistros,
    itemSelecionado,
    setItemSelecionado,
    isModalOpen,
    setIsModalOpen,
    itemEditando,
    setItemEditando,
    isAuthenticated,
    setIsAuthenticated,
    authRole,
    setAuthRole,
    login,
    setLogin,
    loginError,
    setLoginError,
    showPassword,
    setShowPassword,
    isUserMenuOpen,
    setIsUserMenuOpen,
    showAdminAccessArea,
    setShowAdminAccessArea,
    adminUsername,
    setAdminUsername,
    modoBarra,
    setModoBarra,
    periodo,
    setPeriodo,
    credentialsForm,
    setCredentialsForm,
    credentialsFeedback,
    setCredentialsFeedback,
    novoUsuarioForm,
    setNovoUsuarioForm,
    novoUsuarioFeedback,
    setNovoUsuarioFeedback,
    listaUsuarios,
    setListaUsuarios,
    cadastroPublicoForm,
    setCadastroPublicoForm,
    cadastroPublicoFeedback,
    setCadastroPublicoFeedback,
    showSignupSecret,
    setShowSignupSecret,
    clientCadastrosOpen,
    setClientCadastrosOpen,
    form,
    setForm,
    carregarSnapshots,
    carregarUsuarios,
    adicionar,
    remover,
    formatarMoedaBR,
    saveSnapshot,
    loadSnapshot,
    exitLoadedSnapshot,
    removeSnapshot,
    abrirEdicao,
    salvarEdicao,
    autenticar,
    sairPainel,
    abrirPainelAcesso,
    alterarCredenciais,
    cadastrarNovoUsuario,
    cadastroPublico,
    registrosFiltrados,
    snapshotsFiltradosPorPeriodo,
    totalGeral,
    totalLiters,
    litrosDiesel,
    litrosGasolina,
    custoDiesel,
    custoGasolina,
    percDiesel,
    mediasCategoria,
    syncPeriodoFromUrl,
  };

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) {
    throw new Error('useFleet deve ser usado dentro de FleetProvider');
  }
  return ctx;
}
