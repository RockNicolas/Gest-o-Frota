import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useFleet } from '../context/FleetContext';

export default function LoginPage() {
  const {
    isAuthenticated,
    login,
    setLogin,
    loginError,
    showPassword,
    setShowPassword,
    autenticar,
  } = useFleet();

  if (isAuthenticated) {
    return <Navigate to="/admin/cadastro/semanal" replace />;
  }

  return (
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
  );
}
