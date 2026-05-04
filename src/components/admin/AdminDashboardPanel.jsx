import React from 'react';
import { TrendingUp } from 'lucide-react';
import ListaCategoria from '../ListaCategoria';
import ResumoFinanceiro from '../ResumoFinanceiro';
import { useFleet } from '../../context/FleetContext';

export default function AdminDashboardPanel() {
  const {
    periodo,
    modoBarra,
    setModoBarra,
    registrosFiltrados,
    abrirEdicao,
    remover,
    totalGeral,
    formatarMoedaBR,
    mediasCategoria,
    litrosDiesel,
    litrosGasolina,
    percDiesel,
    custoDiesel,
    custoGasolina,
    loadedSnapshotTitle,
    exitLoadedSnapshot,
  } = useFleet();

  const label = periodo === 'mensal' ? 'Mensal' : 'Semanal';

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 mt-8">
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 md:p-10 text-white flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
        <div className="flex items-center gap-4 md:gap-6 min-w-0">
          <img src="../../public/company_2.png" alt="Logo" className="w-14 h-14 md:w-16 md:h-16 object-contain shrink-0" />
          <div>
            <h2 className="text-2xl md:text-4xl font-black uppercase italic leading-none tracking-tighter">Gestão de Frota Ativa</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-red-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em]">
              <TrendingUp size={14} /> Dashboard — {label}
            </div>
          </div>
        </div>
        <div className="text-left lg:text-right bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md self-start lg:self-auto w-full lg:w-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Custo total ({label})</p>
          <p className="text-2xl md:text-3xl font-black text-red-500 font-mono">R$ {formatarMoedaBR(totalGeral)}</p>
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
              onClick={() => exitLoadedSnapshot()}
              className="shrink-0 bg-amber-900 hover:bg-amber-950 text-white font-black py-2 px-4 rounded-xl uppercase text-[10px] tracking-widest transition-all"
            >
              Sair do cadastro
            </button>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-base md:text-lg font-extrabold">Escala de Barra:</span>
          <button
            type="button"
            className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${modoBarra === 'valor' ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
            onClick={() => setModoBarra('valor')}
          >
            Horas/Km
          </button>
          <button
            type="button"
            className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${modoBarra === 'custo' ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
            onClick={() => setModoBarra('custo')}
          >
            Valor (R$)
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12 pb-12 border-b border-slate-100">
          <ListaCategoria titulo="Máquinas" icone="🚜" corBarra="border-orange-500" itens={registrosFiltrados.filter((r) => r.categoria === 'Máquina')} modoBarra={modoBarra} abrirEdicao={abrirEdicao} remover={remover} />
          <ListaCategoria titulo="Caminhões" icone="🚛" corBarra="border-green-600" itens={registrosFiltrados.filter((r) => r.categoria === 'Caminhão')} modoBarra={modoBarra} abrirEdicao={abrirEdicao} remover={remover} />
          <ListaCategoria titulo="Veículos" icone="🚗" corBarra="border-blue-600" itens={registrosFiltrados.filter((r) => r.categoria === 'Veículo')} modoBarra={modoBarra} abrirEdicao={abrirEdicao} remover={remover} />
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
      </div>
    </div>
  );
}
