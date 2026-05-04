import React from 'react';
import { TrendingUp, Archive } from 'lucide-react';
import ListaCliente from '../components/cliente/ListaCliente';
import ResumoFinanceiro from '../components/ResumoFinanceiro';
import { useFleet } from '../context/FleetContext';

export default function ClienteHomePage() {
  const {
    periodo,
    setPeriodo,
    loadedSnapshotTitle,
    exitLoadedSnapshot,
    setClientCadastrosOpen,
    carregarSnapshots,
    clientCadastrosOpen,
    snapshotsFiltradosPorPeriodo,
    loadSnapshot,
    registrosFiltrados,
    modoBarra,
    setModoBarra,
    setItemSelecionado,
    totalGeral,
    formatarMoedaBR,
    mediasCategoria,
    litrosDiesel,
    litrosGasolina,
    percDiesel,
    custoDiesel,
    custoGasolina,
  } = useFleet();

  return (
    <div className="p-4 md:p-10 space-y-6 max-w-9xl mx-auto">
      <div id="print-area" className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 md:p-10 text-white flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex items-center gap-4 md:gap-6 min-w-0">
            <img src="./company_2.png" alt="Logo" className="w-14 h-14 md:w-16 md:h-16 object-contain shrink-0" />
            <div>
              <h2 className="text-2xl md:text-4xl font-black uppercase italic leading-none tracking-tighter">Monte Cristo Insight</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-red-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em]">
                <TrendingUp size={14} /> Controle de Frota Ativo
              </div>
            </div>
          </div>
          <div className="text-left lg:text-right bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md self-start lg:self-auto w-full lg:w-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Custo {periodo === 'semanal' ? 'Semanal' : 'Mensal'}
            </p>
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
                type="button"
                className={`px-5 py-2 rounded-full text-sm md:text-base font-bold transition-colors ${periodo === 'semanal' ? 'bg-slate-900 text-white border border-slate-900' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                onClick={() => setPeriodo('semanal')}
              >
                Semanal
              </button>
              <button
                type="button"
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
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <ListaCliente titulo="Máquinas" icone="🚜" corBarra="border-orange-500" itens={registrosFiltrados.filter((r) => r.categoria === 'Máquina')} modoBarra={modoBarra} aoSelecionar={setItemSelecionado} />
            <ListaCliente titulo="Caminhões" icone="🚛" corBarra="border-green-600" itens={registrosFiltrados.filter((r) => r.categoria === 'Caminhão')} modoBarra={modoBarra} aoSelecionar={setItemSelecionado} />
            <ListaCliente titulo="Veículos" icone="🚗" corBarra="border-blue-600" itens={registrosFiltrados.filter((r) => r.categoria === 'Veículo')} modoBarra={modoBarra} aoSelecionar={setItemSelecionado} />
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
                    <li key={snapshot.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                      <div>
                        <p className="font-bold text-slate-800">{snapshot.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(snapshot.createdAt).toLocaleString('pt-BR')} — {snapshot.registros.length} registro(s)
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
  );
}
