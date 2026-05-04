import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Formulario from '../../components/Formulario';
import AdminDashboardPanel from '../../components/admin/AdminDashboardPanel';
import { useFleet } from '../../context/FleetContext';
import { normalizarPeriodoUrl } from '../../utils/frotaCalculations';

export default function AdminCadastroPage() {
  const { periodo: periodoParam } = useParams();
  const { form, setForm, adicionar, syncPeriodoFromUrl } = useFleet();

  if (periodoParam !== 'semanal' && periodoParam !== 'mensal') {
    return <Navigate to="/admin/cadastro/semanal" replace />;
  }

  useEffect(() => {
    syncPeriodoFromUrl(periodoParam);
  }, [periodoParam, syncPeriodoFromUrl]);

  const label = normalizarPeriodoUrl(periodoParam) === 'mensal' ? 'Mensal' : 'Semanal';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-950">
        <span className="uppercase tracking-wide">Cadastro {label}</span>
        <span className="block text-xs font-semibold text-emerald-900 mt-1">
          Rota: <code className="font-mono bg-white/70 px-1 rounded">/admin/cadastro/{periodoParam}</code> — o período vem da URL; use o menu para trocar.
        </span>
      </div>
      <Formulario form={form} setForm={setForm} adicionar={adicionar} />
      <AdminDashboardPanel />
    </div>
  );
}
