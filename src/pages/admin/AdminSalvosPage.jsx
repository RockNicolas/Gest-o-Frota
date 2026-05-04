import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useFleet } from '../../context/FleetContext';
import { normalizarPeriodoUrl } from '../../utils/frotaCalculations';

export default function AdminSalvosPage() {
  const { periodo: periodoParam } = useParams();
  const {
    syncPeriodoFromUrl,
    snapshotTitle,
    setSnapshotTitle,
    saveSnapshot,
    snapshotFeedback,
    snapshotsFiltradosPorPeriodo,
    loadSnapshot,
    removeSnapshot,
    periodo,
  } = useFleet();

  if (periodoParam !== 'semanal' && periodoParam !== 'mensal') {
    return <Navigate to="/admin/salvos/semanal" replace />;
  }

  useEffect(() => {
    syncPeriodoFromUrl(periodoParam);
  }, [periodoParam, syncPeriodoFromUrl]);

  const label = normalizarPeriodoUrl(periodoParam) === 'mensal' ? 'Mensal' : 'Semanal';

  return (
    <div className="mt-4 bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="font-black uppercase tracking-wider text-sm text-slate-800">Cadastros salvos — {label}</h2>
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
        <p className="text-sm text-slate-500">Nenhum cadastro {periodo === 'semanal' ? 'semanal' : 'mensal'} salvo ainda.</p>
      )}
    </div>
  );
}
