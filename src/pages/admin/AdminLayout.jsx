import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

function navClass({ isActive }) {
  return `px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
    isActive ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
  }`;
}

export default function AdminLayout() {
  const {
    authRole,
    isUserMenuOpen,
    setIsUserMenuOpen,
    sairPainel,
    abrirPainelAcesso,
    showAdminAccessArea,
    setShowAdminAccessArea,
    novoUsuarioForm,
    setNovoUsuarioForm,
    cadastrarNovoUsuario,
    novoUsuarioFeedback,
    listaUsuarios,
    credentialsForm,
    setCredentialsForm,
    alterarCredenciais,
    credentialsFeedback,
    adminUsername,
  } = useFleet();

  return (
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
          <button
            type="button"
            onClick={sairPainel}
            className="bg-red-600 px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase hover:bg-red-700 transition-all"
          >
            Sair do Painel
          </button>

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

      <nav className="flex flex-col gap-4 mb-2" aria-label="Navegação do painel">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold text-slate-800 shrink-0">Cadastro</span>
          <NavLink to="/admin/cadastro/semanal" className={navClass}>
            Semanal
          </NavLink>
          <NavLink to="/admin/cadastro/mensal" className={navClass}>
            Mensal
          </NavLink>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold text-slate-800 shrink-0">Salvos</span>
          <NavLink to="/admin/salvos/semanal" className={navClass}>
            Semanal
          </NavLink>
          <NavLink to="/admin/salvos/mensal" className={navClass}>
            Mensal
          </NavLink>
        </div>
      </nav>

      <Outlet />

      {authRole === 'admin' && showAdminAccessArea ? (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] p-4 md:p-8 overflow-y-auto"
          onClick={() => setShowAdminAccessArea(false)}
          role="presentation"
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
              <p className="text-xs text-slate-500 mt-1">Atualize aqui o usuário e a senha de acesso do painel administrativo.</p>
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
    </div>
  );
}
