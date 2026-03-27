import React from 'react';
import { X, Info, User, Gauge } from 'lucide-react';

const obterLitrosCalculo = (item) => {
  const texto = String(item.observacoes || '');
  const match = texto.match(/\[\[LITROS_CALC:([0-9.,]+)\]\]/);
  if (!match) return Number(item.litros || 0);
  const valor = Number(String(match[1]).replace(',', '.'));
  return Number.isFinite(valor) ? valor : Number(item.litros || 0);
};

const limparObservacoes = (observacoes) =>
  String(observacoes || '')
    .replace(/\[\[LITROS_CALC:[0-9.,]+\]\]\s*/g, '')
    .replace(/\[\[TANQUE_IMG:[^\]]+\]\]\s*/g, '')
    .trim();

const obterTanqueImagem = (item) => {
  const texto = String(item.observacoes || '');
  const match = texto.match(/\[\[TANQUE_IMG:([^\]]+)\]\]/);
  return match ? String(match[1]) : '';
};

const formatarUso = (item) => {
  const valor = Number(item.valor || 0);
  if (item.categoria === 'Máquina') {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
};

const ModalDetalhes = ({ item, fechar }) => {
  if (!item) return null;
  const isMaquina = item.categoria === 'Máquina';
  const unidadeUso = isMaquina ? 'h' : 'km';
  const labelConsumo = isMaquina ? 'Consumo Médio' : 'Eficiência';
  const sufixoConsumo = isMaquina ? 'L/h' : 'km/L';
  const litrosCalculo = obterLitrosCalculo(item);
  const tanqueImagem = obterTanqueImagem(item);
  
  const consumoMedio = isMaquina 
    ? (item.valor > 0 ? (litrosCalculo / item.valor).toFixed(2) : 0)
    : (litrosCalculo > 0 ? (item.valor / litrosCalculo).toFixed(2) : 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 text-left">
        <div className="bg-slate-900 p-5 md:p-8 text-white relative shrink-0">
          <button onClick={fechar} className="absolute top-6 right-6 bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors">
            <X size={20} />
          </button>
          <span className="bg-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">
            Detalhes do Registro
          </span>
          <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none pr-12">{item.nome}</h3>
          
          <div className="flex items-center gap-4 mt-4 text-slate-300 font-bold uppercase tracking-widest">
             <span className="flex items-center gap-2 text-xl">
               <User size={24} /> 
               {item.motorista}
             </span>
          </div>
        </div>

        <div className="p-5 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Uso Registrado</p>
              <p className="text-xl font-black text-slate-800">{formatarUso(item)} {unidadeUso}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Volume</p>
              <p className="text-xl font-black text-blue-600">{item.litros} Litros</p>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 sm:col-span-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase mb-1">{labelConsumo}</p>
                <p className="text-2xl font-black text-blue-700">{consumoMedio} <span className="text-sm">{sufixoConsumo}</span></p>
              </div>
              <Gauge size={32} className="text-blue-200" />
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
            <div>
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Custo Total</p>
              <p className="text-3xl font-black text-red-600">R$ {Number(item.custo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {tanqueImagem ? (
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanque antes do abastecimento</p>
              <img src={`/tanque/${tanqueImagem}`} alt="Nível do tanque antes do abastecimento" className="w-full max-h-40 object-contain" />
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest">
                <Info size={14} className="text-blue-500"/> Observações do Lançamento
            </label>
            <div className="whitespace-pre-wrap w-full bg-slate-50 border border-slate-200 p-5 rounded-3xl text-slate-700 font-bold italic leading-relaxed shadow-inner break-words">
              {limparObservacoes(item.observacoes) || "Nenhuma observação técnica foi relatada."}
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