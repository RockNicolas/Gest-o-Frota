import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, User, LogOut, Archive } from 'lucide-react';
import Formulario from './components/Formulario';
import ListaCategoria from './components/ListaCategoria';
import ModalEdit from './components/ModalEdit';
import ResumoFinanceiro from './components/ResumoFinanceiro';
import ListaCliente from './components/cliente/ListaCliente';
import ModalDetalhes from './components/cliente/ModalDetalhes';

function readRoleFromToken(token) {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(atob(padded));
    return json.role || 'admin';
  } catch {
    return null;
  }
}

function parseNumeroEntrada(valor, categoria) {
  const texto = String(valor ?? '').trim();
  if (!texto) return 0;

  const isKm = categoria === 'Caminhão' || categoria === 'Veículo';
  if (isKm) {
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(texto)) {
      return Number(texto.replace(/\./g, '').replace(',', '.'));
    }
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(texto)) {
      return Number(texto.replace(/,/g, ''));
    }
  }

  return Number(texto.replace(',', '.'));
}

function extrairLitrosCalculoMeta(observacoes) {
  const texto = String(observacoes || '');
  const match = texto.match(/\[\[LITROS_CALC:([0-9.,]+)\]\]/);
  if (!match) return null;
  const valor = Number(String(match[1]).replace(',', '.'));
  return Number.isFinite(valor) ? valor : null;
}

function calcularMediaCategoria(registros, categoria, titulo, periodoAtual) {
  const itens = registros.filter((registro) => registro.categoria === categoria);
  const isMaquina = categoria === 'Máquina';

  const { somaConsumo, quantidadeConsumos } = itens.reduce(
    (acc, item) => {
      const uso = Number(item.valor || 0);
      const litrosMeta = extrairLitrosCalculoMeta(item.observacoes);
      const litrosBase =
        periodoAtual === 'mensal'
          ? Number(item.litros || 0)
          : (litrosMeta ?? Number(item.litros || 0));

      if (uso > 0 && litrosBase > 0) {
        const consumo = isMaquina ? litrosBase / uso : uso / litrosBase;
        return {
          somaConsumo: acc.somaConsumo + consumo,
          quantidadeConsumos: acc.quantidadeConsumos + 1,
        };
      }

      return acc;
    },
    { somaConsumo: 0, quantidadeConsumos: 0 }
  );

  const media = quantidadeConsumos > 0 ? somaConsumo / quantidadeConsumos : 0;

  return {
    categoria,
    titulo,
    quantidade: itens.length,
    media,
    totalUso: itens.reduce((acc, item) => acc + Math.max(Number(item.valor || 0), 0), 0),
    unidadeUso: isMaquina ? 'h' : 'km',
    unidadeMedia: isMaquina ? 'L/h' : 'km/L',
  };
}

function extrairTanqueImagemMeta(observacoes) {
  const texto = String(observacoes || '');
  const match = texto.match(/\[\[TANQUE_IMG:([^\]]+)\]\]/);
  return match ? String(match[1]) : '';
}

function removerLitrosCalculoMeta(observacoes) {
  return String(observacoes || '')
    .replace(/\[\[LITROS_CALC:[0-9.,]+\]\]\s*/g, '')
    .replace(/\[\[TANQUE_IMG:[^\]]+\]\]\s*/g, '')
    .trim();
}

function montarObservacoesComMeta(observacoes, litrosCalculo, tanqueImagem) {
  const limpo = removerLitrosCalculoMeta(observacoes);
  const litrosNum = Number(litrosCalculo);
  const metas = [];

  if (litrosNum > 0) {
    metas.push(`[[LITROS_CALC:${litrosNum}]]`);
  }
  if (tanqueImagem) {
    metas.push(`[[TANQUE_IMG:${tanqueImagem}]]`);
  }

  const prefixo = metas.join('\n');
  if (!prefixo) return limpo;
  return limpo ? `${prefixo}\n${limpo}` : prefixo;
}

function App() {
  const API_URL_PRIMARY = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:3001');
  const API_URL_FALLBACK = import.meta.env.PROD ? '' : 'http://127.0.0.1:3001';
  const ADMIN_AUTH_TOKEN_KEY = 'admin_auth_token';
  const AUTH_ROLE_KEY = 'auth_role';

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
      // Em algumas máquinas/browser, `localhost` pode resolver para IPv6 e falhar.
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
  const [modoBarra, setModoBarra] = useState('valor'); // 'valor' ou 'custo'
  const [periodo, setPeriodo] = useState('semanal'); // 'semanal' ou 'mensal'
  const [adminTab, setAdminTab] = useState('dashboard');
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
    observacoes: '' 
  });

  useEffect(() => {
    // Tenta carregar do banco; se falhar, mantém o fallback do localStorage.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const valorParaSalvar = temDeltaValido ? (valorAtualNum - valorAnteriorNum) : valorAtualNum;
      const litrosParaSalvar = litrosTotalNum;
      const custoTotalNum = parseNumeroEntrada(form.custoTotal, form.categoria);
      const precoLitroParaSalvar = litrosParaSalvar > 0 ? (custoTotalNum / litrosParaSalvar) : 0;
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
      setRegistros(prev => [...prev, novoRegistro]);
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
    } catch (e) {
      console.error('Erro ao salvar no banco:', e);
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
      setRegistros(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error('Erro ao excluir no banco:', e);
    }
  };
  const formatarMoedaBR = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
      setSavedSnapshots(prev => [novoSnapshot, ...prev]);
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
    setPeriodo(snapshot.periodo || 'semanal');
    setLoadedSnapshotTitle(snapshot.title);
    setSnapshotFeedback(`Cadastro "${snapshot.title}" carregado.`);
    if (!opts.skipAdminTab) {
      setAdminTab('dashboard');
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
      setAdminTab('saved');
    }
  };

  const removeSnapshot = async (id) => {
    try {
      const resp = await apiFetch('/api/snapshots', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setSavedSnapshots(prev => prev.filter((snapshot) => snapshot.id !== id));
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
      const precoLitroCalculado = litrosNum > 0 ? (custoNum / litrosNum) : 0;
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
      setRegistros(prev => prev.map(r => (r.id === registroAtualizado.id ? registroAtualizado : r)));
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
      return;
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

  const registrosFiltrados = registros.filter((registro) => (registro.periodo || 'semanal') === periodo);
  const snapshotsFiltradosPorPeriodo = savedSnapshots.filter(
    (snapshot) => (snapshot.periodo || 'semanal') === periodo
  );
  const totalGeral = registrosFiltrados.reduce((acc, curr) => acc + Number(curr.custo || 0), 0);
  const totalLiters = registrosFiltrados.reduce((acc, curr) => acc + Number(curr.litros || 0), 0);
  const litrosDiesel = registrosFiltrados.filter(r => r.tipo === 'Diesel').reduce((a, b) => a + Number(b.litros || 0), 0);
  const litrosGasolina = registrosFiltrados.filter(r => r.tipo === 'Gasolina').reduce((a, b) => a + Number(b.litros || 0), 0);
  const custoDiesel = registrosFiltrados.filter(r => r.tipo === 'Diesel').reduce((a, b) => a + Number(b.custo || 0), 0);
  const custoGasolina = registrosFiltrados.filter(r => r.tipo === 'Gasolina').reduce((a, b) => a + Number(b.custo || 0), 0);
  const percDiesel = totalLiters ? (litrosDiesel / totalLiters) * 100 : 50;
  const mediasCategoria = [
    calcularMediaCategoria(registrosFiltrados, 'Máquina', 'Retro / Máquinas', periodo),
    calcularMediaCategoria(registrosFiltrados, 'Caminhão', 'Caminhões', periodo),
    calcularMediaCategoria(registrosFiltrados, 'Veículo', 'Veículos', periodo),
  ];

  return (
    <Router>
      <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] font-sans text-left">
        <Routes>
          <Route path="/" element={
            <div className="p-4 md:p-10 space-y-6 max-w-9xl mx-auto">
              <div id="print-area" className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 md:p-10 text-white flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
                  <div className="flex items-center gap-4 md:gap-6 min-w-0"> 
                    <img src="./company_2.png" alt="Logo" className="w-14 h-14 md:w-16 md:h-16 object-contain shrink-0" />
                    <div>
                      <h2 className="text-2xl md:text-4xl font-black uppercase italic leading-none tracking-tighter">Monte Cristo Insight</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-red-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em]">
                        <TrendingUp size={14}/> Controle de Frota Ativo
                      </div>
                    </div>
                  </div>
                  <div className="text-left lg:text-right bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md self-start lg:self-auto w-full lg:w-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Custo {periodo === 'semanal' ? 'Semanal' : 'Mensal'}</p>
                    <p className="text-2xl md:text-3xl font-black text-red-500">R$ {formatarMoedaBR(totalGeral)}</p>
                  </div>
                </div>

                <div className="p-5 md:p-12">
                  {loadedSnapshotTitle ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-950">
                      <p className="text-sm font-semibold">
                        Visualizando cadastro salvo: <span className="font-black">{loadedSnapshotTitle}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => exitLoadedSnapshot({ skipAdminTab: true })}
                        className="shrink-0 bg-amber-900 hover:bg-amber-950 text-white font-black py-2 px-4 rounded-xl uppercase text-[10px] tracking-widest transition-all"
                      >
                        Sair do cadastro
                      </button>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                      <span className="text-base md:text-lg font-extrabold">Período:</span>
                      <button
                        className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${periodo === 'semanal' ? 'bg-slate-900 text-white border border-slate-900' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                        onClick={() => setPeriodo('semanal')}
                      >
                        Semanal
                      </button>
                      <button
                        className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${periodo === 'mensal' ? 'bg-slate-900 text-white border border-slate-900' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                        onClick={() => setPeriodo('mensal')}
                      >
                        Mensal
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setClientCadastrosOpen(true);
                        carregarSnapshots();
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm md:text-base font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 transition-colors w-full sm:w-auto"
                    >
                      <Archive size={18} className="shrink-0" />
                      Cadastros salvos
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-base md:text-lg font-extrabold">Escala de Barra:</span>
                    <button
                      className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${modoBarra === 'valor' ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                      onClick={() => setModoBarra('valor')}
                    >
                      Horas/Km
                    </button>
                    <button
                      className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${modoBarra === 'custo' ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                      onClick={() => setModoBarra('custo')}
                    >
                      Valor (R$)
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8 mb-12">
                      <ListaCliente titulo="Máquinas" icone="🚜" corBarra="border-orange-500" itens={registrosFiltrados.filter(r => r.categoria === 'Máquina')} modoBarra={modoBarra} aoSelecionar={setItemSelecionado} />
                      <ListaCliente titulo="Caminhões" icone="🚛" corBarra="border-green-600" itens={registrosFiltrados.filter(r => r.categoria === 'Caminhão')} modoBarra={modoBarra} aoSelecionar={setItemSelecionado} />
                      <ListaCliente titulo="Veículos" icone="🚗" corBarra="border-blue-600" itens={registrosFiltrados.filter(r => r.categoria === 'Veículo')} modoBarra={modoBarra} aoSelecionar={setItemSelecionado} />
                  </div>
                  <ResumoFinanceiro 
                    mediasCategoria={mediasCategoria}
                    litrosDiesel={litrosDiesel} litrosGasolina={litrosGasolina} percDiesel={percDiesel} 
                    custoDiesel={custoDiesel} custoGasolina={custoGasolina} formatarMoedaBR={formatarMoedaBR} 
                  />
                </div>
              </div>

              {clientCadastrosOpen ? (
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[130] p-4 md:p-8 overflow-y-auto"
                  onClick={() => setClientCadastrosOpen(false)}
                  role="presentation"
                >
                  <div
                    className="max-w-lg mx-auto mt-4 md:mt-12 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-labelledby="client-cadastros-titulo"
                  >
                    <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-3">
                      <h2 id="client-cadastros-titulo" className="font-black uppercase tracking-wider text-sm">
                        Cadastros salvos
                      </h2>
                      <button
                        type="button"
                        onClick={() => setClientCadastrosOpen(false)}
                        className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-black uppercase tracking-widest"
                      >
                        Fechar
                      </button>
                    </div>
                    <div className="p-5 md:p-6 max-h-[min(70vh,32rem)] overflow-y-auto">
                      <p className="text-xs text-slate-500 mb-4">
                        Carregue um cadastro para visualizar na página. Para salvar ou excluir, use o painel administrativo.
                      </p>
                      {snapshotsFiltradosPorPeriodo.length > 0 ? (
                        <ul className="space-y-3">
                          {snapshotsFiltradosPorPeriodo.map((snapshot) => (
                            <li
                              key={snapshot.id}
                              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3"
                            >
                              <div>
                                <p className="font-bold text-slate-800">{snapshot.title}</p>
                                <p className="text-xs text-slate-500">
                                  {new Date(snapshot.createdAt).toLocaleString('pt-BR')} — {snapshot.registros.length}{' '}
                                  registro(s)
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  loadSnapshot(snapshot, { skipAdminTab: true });
                                  setClientCadastrosOpen(false);
                                }}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 px-4 rounded-xl uppercase text-[10px] tracking-widest transition-all"
                              >
                                Carregar
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Nenhum cadastro {periodo === 'semanal' ? 'semanal' : 'mensal'} salvo ainda.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          } />

          <Route path="/admin" element={
            isAuthenticated ? (
            <div className="p-4 md:p-10 space-y-6 max-w-9xl mx-auto">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-slate-900 p-4 md:p-6 rounded-3xl text-white shadow-xl">
                <div>
                  <h1 className="font-black uppercase tracking-widest text-sm">Painel Administrativo - Monte Cristo</h1>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
                    Sessão: {authRole === 'admin' ? 'Administrador' : 'Usuário'}
                  </p>
                </div>
                <div className="relative flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="bg-white/10 border border-white/10 p-2 rounded-xl hover:bg-white/20 transition-all"
                    aria-label="Abrir menu do usuário"
                  >
                    <User size={18} />
                  </button>
                  <button onClick={sairPainel} className="bg-red-600 px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase hover:bg-red-700 transition-all">Sair do Painel</button>

                  {isUserMenuOpen ? (
                    <div className="absolute right-0 top-12 w-48 bg-white text-slate-800 rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50">
                      <button
                        type="button"
                        onClick={abrirPainelAcesso}
                        className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-100 transition-colors"
                      >
                        Painel de Acesso
                      </button>
                      <button
                        type="button"
                        onClick={sairPainel}
                        className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Deslogar
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-base md:text-lg font-extrabold">Período:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPeriodo('semanal');
                    setForm((prev) => ({ ...prev, periodo: 'semanal' }));
                  }}
                  className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${periodo === 'semanal' ? 'bg-slate-900 text-white border border-slate-900' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                >
                  Semanal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPeriodo('mensal');
                    setForm((prev) => ({ ...prev, periodo: 'mensal' }));
                  }}
                  className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${periodo === 'mensal' ? 'bg-slate-900 text-white border border-slate-900' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                >
                  Mensal
                </button>
              </div>

              <Formulario form={form} setForm={setForm} adicionar={adicionar} />

              {authRole === 'admin' && showAdminAccessArea ? (
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] p-4 md:p-8 overflow-y-auto"
                  onClick={() => setShowAdminAccessArea(false)}
                >
                  <div
                    id="admin-access-panel"
                    className="max-w-6xl mx-auto space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
                      <h2 className="font-black uppercase tracking-wider text-sm">Painel de Acesso</h2>
                      <button
                        type="button"
                        onClick={() => setShowAdminAccessArea(false)}
                        className="text-[10px] bg-red-600 px-3 py-2 rounded-lg font-black uppercase tracking-widest hover:bg-red-700"
                      >
                        Fechar
                      </button>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200">
                      <h2 className="font-black uppercase tracking-wider text-sm text-slate-800">Usuários do sistema</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Cadastre usuários que acessam este painel com permissão de operador (sem alterar o administrador principal).
                      </p>
                      <form onSubmit={cadastrarNovoUsuario} className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                        <input
                          type="text"
                          placeholder="Nome de usuário"
                          value={novoUsuarioForm.username}
                          onChange={(e) => setNovoUsuarioForm({ ...novoUsuarioForm, username: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold"
                          autoComplete="off"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Senha"
                          value={novoUsuarioForm.password}
                          onChange={(e) => setNovoUsuarioForm({ ...novoUsuarioForm, password: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold"
                          autoComplete="new-password"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Confirmar senha"
                          value={novoUsuarioForm.confirmPassword}
                          onChange={(e) => setNovoUsuarioForm({ ...novoUsuarioForm, confirmPassword: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold"
                          autoComplete="new-password"
                          required
                        />
                        <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 px-4 rounded-xl transition-all uppercase text-[10px] tracking-widest">
                          Cadastrar usuário
                        </button>
                      </form>
                      {novoUsuarioFeedback.erro ? <p className="text-sm text-red-600 font-semibold mt-3">{novoUsuarioFeedback.erro}</p> : null}
                      {novoUsuarioFeedback.sucesso ? <p className="text-sm text-green-700 font-semibold mt-3">{novoUsuarioFeedback.sucesso}</p> : null}
                      {listaUsuarios.length > 0 ? (
                        <div className="mt-6 border-t border-slate-100 pt-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Usuários cadastrados</p>
                          <ul className="space-y-2 text-sm">
                            {listaUsuarios.map((u) => (
                              <li key={u.id} className="flex justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                                <span className="font-bold text-slate-800">{u.username}</span>
                                <span className="text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200">
                      <h2 className="font-black uppercase tracking-wider text-sm text-slate-800">Segurança do Painel</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Atualize aqui o usuário e a senha de acesso do painel administrativo.
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Usuário atual ativo: <span className="font-bold text-slate-700">{adminUsername || 'admin'}</span>
                      </p>
                      <form onSubmit={alterarCredenciais} className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
                        <input
                          type="text"
                          placeholder="Usuário atual"
                          value={credentialsForm.usuarioAtual}
                          onChange={(e) => setCredentialsForm({ ...credentialsForm, usuarioAtual: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Novo usuário"
                          value={credentialsForm.novoUsuario}
                          onChange={(e) => setCredentialsForm({ ...credentialsForm, novoUsuario: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Senha atual"
                          value={credentialsForm.senhaAtual}
                          onChange={(e) => setCredentialsForm({ ...credentialsForm, senhaAtual: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Nova senha"
                          value={credentialsForm.novaSenha}
                          onChange={(e) => setCredentialsForm({ ...credentialsForm, novaSenha: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Confirmar nova senha"
                          value={credentialsForm.confirmarNovaSenha}
                          onChange={(e) => setCredentialsForm({ ...credentialsForm, confirmarNovaSenha: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold"
                          required
                        />
                        <button type="submit" className="md:col-span-5 bg-slate-900 hover:bg-slate-800 text-white font-black py-3 px-4 rounded-xl transition-all uppercase text-[10px] tracking-widest">
                          Alterar Usuário e Senha
                        </button>
                      </form>
                      {credentialsFeedback.erro ? <p className="text-sm text-red-600 font-semibold mt-3">{credentialsFeedback.erro}</p> : null}
                      {credentialsFeedback.sucesso ? <p className="text-sm text-green-700 font-semibold mt-3">{credentialsFeedback.sucesso}</p> : null}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 md:p-10 text-white flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
                  <div className="flex items-center gap-4 md:gap-6 min-w-0"> 
                    <img src="./company_2.png" alt="Logo" className="w-14 h-14 md:w-16 md:h-16 object-contain shrink-0" />
                    <div>
                      <h2 className="text-2xl md:text-4xl font-black uppercase italic leading-none tracking-tighter">Gestão de Frota Ativa</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-red-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em]">
                        <TrendingUp size={14}/> Dashboard Administrativo
                      </div>
                    </div>
                  </div>
                  <div className="text-left lg:text-right bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md self-start lg:self-auto w-full lg:w-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Custo Total Acumulado</p>
                    <p className="text-2xl md:text-3xl font-black text-red-500 font-mono">R$ {formatarMoedaBR(totalGeral)}</p>
                  </div>
                </div>

                <div className="p-5 md:p-12">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => setAdminTab('dashboard')}
                        className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${adminTab === 'dashboard' ? 'bg-white text-slate-900 border border-slate-300 shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'}`}
                      >
                        Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminTab('saved')}
                        className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${adminTab === 'saved' ? 'bg-white text-slate-900 border border-slate-300 shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'}`}
                      >
                        Cadastros Salvos
                      </button>
                      {loadedSnapshotTitle ? (
                        <button
                          type="button"
                          onClick={exitLoadedSnapshot}
                          className="ml-auto bg-red-600 hover:bg-red-700 text-white font-black py-2 px-4 rounded-xl uppercase text-[10px] tracking-widest transition-all"
                        >
                          Sair do cadastro
                        </button>
                      ) : null}
                    </div>
                    {adminTab === 'dashboard' ? (
                      <>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="text-base md:text-lg font-extrabold">Escala de Barra:</span>
                          <button
                            className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${modoBarra === 'valor' ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                            onClick={() => setModoBarra('valor')}
                          >
                            Horas/Km
                          </button>
                          <button
                            className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${modoBarra === 'custo' ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                            onClick={() => setModoBarra('custo')}
                          >
                            Valor (R$)
                          </button>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 mb-12 pb-12 border-b border-slate-100">
                          <ListaCategoria titulo="Máquinas" icone="🚜" corBarra="border-orange-500" itens={registrosFiltrados.filter(r => r.categoria === 'Máquina')} modoBarra={modoBarra} abrirEdicao={abrirEdicao} remover={remover} />
                          <ListaCategoria titulo="Caminhões" icone="🚛" corBarra="border-green-600" itens={registrosFiltrados.filter(r => r.categoria === 'Caminhão')} modoBarra={modoBarra} abrirEdicao={abrirEdicao} remover={remover} />
                          <ListaCategoria titulo="Veículos" icone="🚗" corBarra="border-blue-600" itens={registrosFiltrados.filter(r => r.categoria === 'Veículo')} modoBarra={modoBarra} abrirEdicao={abrirEdicao} remover={remover} />
                        </div>

                        <ResumoFinanceiro 
                          mediasCategoria={mediasCategoria}
                          litrosDiesel={litrosDiesel} 
                          litrosGasolina={litrosGasolina} 
                          percDiesel={percDiesel} 
                          custoDiesel={custoDiesel} 
                          custoGasolina={custoGasolina} 
                          formatarMoedaBR={formatarMoedaBR} 
                        />
                      </>
                    ) : (
                      <div className="mt-4 bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                          <div>
                            <h2 className="font-black uppercase tracking-wider text-sm text-slate-800">Cadastros Salvos</h2>
                            <p className="text-xs text-slate-500 mt-1">Salve o estado atual dos registros com um título e carregue novamente quando quiser.</p>
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-[1fr_auto] items-end mb-4">
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Título do cadastro</label>
                            <input
                              type="text"
                              value={snapshotTitle}
                              onChange={(e) => setSnapshotTitle(e.target.value)}
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl outline-none font-bold"
                              placeholder="Ex: Posto São João - Maio"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={saveSnapshot}
                            className="w-full md:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 px-5 rounded-xl uppercase text-[10px] tracking-widest transition-all"
                          >
                            Salvar Cadastro Atual
                          </button>
                        </div>
                        {snapshotFeedback ? <p className="text-sm text-slate-700 font-semibold mb-4">{snapshotFeedback}</p> : null}
                        {snapshotsFiltradosPorPeriodo.length > 0 ? (
                          <div className="space-y-3">
                            {snapshotsFiltradosPorPeriodo.map((snapshot) => (
                              <div key={snapshot.id} className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                  <p className="font-bold text-slate-800">{snapshot.title}</p>
                                  <p className="text-xs text-slate-500">Salvo em {new Date(snapshot.createdAt).toLocaleString('pt-BR')}</p>
                                  <p className="text-xs text-slate-500 mt-1">{snapshot.registros.length} registro(s)</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => loadSnapshot(snapshot)}
                                    className="bg-slate-900 hover:bg-slate-700 text-white font-black py-2 px-4 rounded-xl uppercase text-[10px] tracking-widest transition-all"
                                  >
                                    Carregar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeSnapshot(snapshot.id)}
                                    className="bg-red-600 text-white hover:bg-red-700 font-black py-2 px-4 rounded-xl uppercase text-[10px] tracking-widest transition-all"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            Nenhum cadastro {periodo === 'semanal' ? 'semanal' : 'mensal'} salvo ainda.
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </div>,
            </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/cadastro" element={
            isAuthenticated ? (
              <Navigate to="/admin" replace />
            ) : (
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
                  <h1 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">Criar conta</h1>
                  <p className="text-sm text-slate-500 mt-2">
                    Cadastro liberado apenas com o código fornecido pelo administrador. Sem alteração no servidor, este fluxo fica desligado.
                  </p>

                  <form onSubmit={cadastroPublico} className="mt-6 space-y-4">
                    <div className="relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">
                        Código de cadastro
                      </label>
                      <input
                        type={showSignupSecret ? 'text' : 'password'}
                        value={cadastroPublicoForm.signupSecret}
                        onChange={(e) =>
                          setCadastroPublicoForm({ ...cadastroPublicoForm, signupSecret: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
                        autoComplete="off"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupSecret((prev) => !prev)}
                        className="absolute top-[2.4rem] right-3 text-slate-500 hover:text-slate-700"
                        aria-label={showSignupSecret ? 'Ocultar código' : 'Mostrar código'}
                      >
                        {showSignupSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">
                        Nome de usuário
                      </label>
                      <input
                        value={cadastroPublicoForm.username}
                        onChange={(e) =>
                          setCadastroPublicoForm({ ...cadastroPublicoForm, username: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
                        autoComplete="username"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">
                        Senha
                      </label>
                      <input
                        type="password"
                        value={cadastroPublicoForm.password}
                        onChange={(e) =>
                          setCadastroPublicoForm({ ...cadastroPublicoForm, password: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">
                        Confirmar senha
                      </label>
                      <input
                        type="password"
                        value={cadastroPublicoForm.confirmPassword}
                        onChange={(e) =>
                          setCadastroPublicoForm({ ...cadastroPublicoForm, confirmPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    {cadastroPublicoFeedback.erro ? (
                      <p className="text-sm text-red-600 font-semibold">{cadastroPublicoFeedback.erro}</p>
                    ) : null}
                    {cadastroPublicoFeedback.sucesso ? (
                      <p className="text-sm text-green-700 font-semibold">{cadastroPublicoFeedback.sucesso}</p>
                    ) : null}

                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest"
                    >
                      Cadastrar
                    </button>
                  </form>

                  <div className="mt-5 text-center space-y-2">
                    <Link to="/login" className="block text-sm text-slate-600 hover:text-slate-800 font-semibold">
                      Já tenho conta — entrar
                    </Link>
                    <Link to="/" className="block text-sm text-slate-600 hover:text-slate-800 font-semibold">
                      Voltar para a página inicial
                    </Link>
                  </div>
                </div>
              </div>
            )
          } />

          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to="/admin" replace />
            ) : (
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
                  <h1 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">Acesso ao painel</h1>
                  <p className="text-sm text-slate-500 mt-2">Entre com administrador ou usuário cadastrado para acessar o painel.</p>

                  <form onSubmit={autenticar} className="mt-6 space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Usuário</label>
                      <input
                        value={login.user}
                        onChange={(e) => setLogin({ ...login, user: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
                        autoComplete="username"
                        required
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Senha</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={login.password}
                        onChange={(e) => setLogin({ ...login, password: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute top-[2.4rem] right-3 text-slate-500 hover:text-slate-700"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {loginError ? <p className="text-sm text-red-600 font-semibold">{loginError}</p> : null}

                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
                      Entrar
                    </button>
                  </form>

                  <div className="mt-5 text-center space-y-2">
                    <Link to="/cadastro" className="block text-sm text-slate-600 hover:text-slate-800 font-semibold">
                      Criar conta (código de cadastro)
                    </Link>
                    <Link to="/" className="block text-sm text-slate-600 hover:text-slate-800 font-semibold">
                      Voltar para a página inicial
                    </Link>
                  </div>
                </div>
              </div>
            )
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <ModalEdit isOpen={isModalOpen} item={itemEditando} setItem={setItemEditando} salvar={salvarEdicao} fechar={() => setIsModalOpen(false)} />
        <ModalDetalhes item={itemSelecionado} fechar={() => setItemSelecionado(null)} />
      </div>
    </Router>
  );
}

export default App;