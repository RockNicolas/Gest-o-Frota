import React from 'react';
import { X, Info, User, Gauge } from 'lucide-react';

const ModalDetalhes = ({ item, fechar }) => {
  if (!item) return null;

  // Lógica de cálculo do consumo médio
  const isMaquina = item.categoria === 'Máquina';
  const unidadeUso = isMaquina ? 'h' : 'km';
  const labelConsumo = isMaquina ? 'Consumo Médio' : 'Eficiência';
  const sufixoConsumo = isMaquina ? 'L/h' : 'km/L';
  
  const consumoMedio = isMaquina 
    ? (item.valor > 0 ? (item.litros / item.valor).toFixed(2) : 0)
    : (item.litros > 0 ? (item.valor / item.litros).toFixed(2) : 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 text-left">
        
        {/* Topo Colorido */}
        <div className="bg-slate-900 p-8 text-white relative">
          <button onClick={fechar} className="absolute top-6 right-6 bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors">
            <X size={20} />
          </button>
          <span className="bg-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">
            Detalhes do Registro
          </span>
          <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{item.nome}</h3>
          <div className="flex items-center gap-4 mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
             <span className="flex items-center gap-1"><User size={14}/> {item.motorista}</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Grid de Dados Rápidos - Agora com 3 colunas ou ajuste para o consumo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Uso Registrado</p>
              <p className="text-xl font-black text-slate-800">{item.valor} {unidadeUso}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Volume</p>
              <p className="text-xl font-black text-blue-600">{item.litros} Litros</p>
            </div>
            {/* Novo Card de Consumo Médio */}
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 col-span-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase mb-1">{labelConsumo}</p>
                <p className="text-2xl font-black text-blue-700">{consumoMedio} <span className="text-sm">{sufixoConsumo}</span></p>
              </div>
              <Gauge size={32} className="text-blue-200" />
            </div>
          </div>

          {/* Destaque Financeiro */}
          <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Custo Total</p>
              <p className="text-4xl font-black text-red-600">R$ {Number(item.custo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">Preço/L</p>
              <p className="font-bold text-slate-600">R$ {Number(item.precoLitro).toFixed(2)}</p>
            </div>
          </div>

          {/* Caixa de Observações Técnica */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest">
              <Info size={14} className="text-blue-500"/> Observações do Lançamento
            </label>
            <div className="w-full bg-slate-50 border border-slate-200 p-5 rounded-3xl min-h-[120px] text-slate-700 font-bold italic leading-relaxed shadow-inner">
              {item.observacoes || "Nenhuma observação técnica foi relatada para este abastecimento."}
            </div>
          </div>

          <button onClick={fechar} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95">
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalhes;