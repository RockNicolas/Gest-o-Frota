import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useFleet } from '../context/FleetContext';

export default function CadastroContaPage() {
  const {
    isAuthenticated,
    cadastroPublicoForm,
    setCadastroPublicoForm,
    cadastroPublicoFeedback,
    showSignupSecret,
    setShowSignupSecret,
    cadastroPublico,
  } = useFleet();

  if (isAuthenticated) {
    return <Navigate to="/admin/cadastro/semanal" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
        <h1 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">Criar conta</h1>
        <p className="text-sm text-slate-500 mt-2">
          Cadastro liberado apenas com o código fornecido pelo administrador. Sem alteração no servidor, este fluxo fica desligado.
        </p>

        <form onSubmit={cadastroPublico} className="mt-6 space-y-4">
          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Código de cadastro</label>
            <input
              type={showSignupSecret ? 'text' : 'password'}
              value={cadastroPublicoForm.signupSecret}
              onChange={(e) => setCadastroPublicoForm({ ...cadastroPublicoForm, signupSecret: e.target.value })}
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
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Nome de usuário</label>
            <input
              value={cadastroPublicoForm.username}
              onChange={(e) => setCadastroPublicoForm({ ...cadastroPublicoForm, username: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Senha</label>
            <input
              type="password"
              value={cadastroPublicoForm.password}
              onChange={(e) => setCadastroPublicoForm({ ...cadastroPublicoForm, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Confirmar senha</label>
            <input
              type="password"
              value={cadastroPublicoForm.confirmPassword}
              onChange={(e) => setCadastroPublicoForm({ ...cadastroPublicoForm, confirmPassword: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
              autoComplete="new-password"
              required
            />
          </div>

          {cadastroPublicoFeedback.erro ? <p className="text-sm text-red-600 font-semibold">{cadastroPublicoFeedback.erro}</p> : null}
          {cadastroPublicoFeedback.sucesso ? <p className="text-sm text-green-700 font-semibold">{cadastroPublicoFeedback.sucesso}</p> : null}

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
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
  );
}
