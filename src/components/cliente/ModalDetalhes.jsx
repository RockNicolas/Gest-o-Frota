import React from 'react';
import { X, Info, User, Gauge, Fuel, DollarSign, Activity } from 'lucide-react';

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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-slate-50 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-white animate-in fade-in zoom-in duration-300">
        
        <div className="p-6 md:p-10 flex flex-col gap-6 overflow-y-auto">
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-200">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-none uppercase tracking-tighter italic">
                  {item.nome}
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Detalhes do Registro</p>
              </div>
            </div>
            <button onClick={fechar} className="cursor-pointer bg-white p-3 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <span className="p-2 bg-slate-100 rounded-xl text-slate-500"><User size={20}/></span>
                  <span className="text-[10px] font-black text-slate-300 uppercase">Motorista / Operador</span>
               </div>
               <p className="text-2xl font-black text-slate-800 mt-4 break-words uppercase italic">{item.motorista}</p>
            </div>

            <div className="md:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso Total</p>
              <p className="text-3xl font-black text-slate-800 italic mt-2">{formatarUso(item)}<span className="text-sm ml-1">{unidadeUso}</span></p>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] flex flex-col justify-between text-white">
               <Gauge size={24} className="text-red-500" />
               <div className="mt-4">
                 <p className="text-[10px] font-bold opacity-50 uppercase">{labelConsumo}</p>
                 <p className="text-3xl font-black leading-none">{consumoMedio}</p>
                 <p className="text-[10px] font-bold opacity-50 uppercase mt-1">{sufixoConsumo}</p>
               </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-[2rem] shadow-lg shadow-blue-100 flex flex-col justify-between text-white">
               <Fuel size={24} className="opacity-50" />
               <div className="mt-4">
                 <p className="text-[10px] font-bold opacity-70 uppercase">Volume</p>
                 <p className="text-3xl font-black">{item.litros}<span className="text-sm ml-1 font-medium">L</span></p>
               </div>
            </div>

            <div className="md:col-span-2 bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center justify-between">
               <div>
                 <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Custo Total</p>
                 <p className="text-4xl font-black text-red-600 tracking-tighter">
                   <span className="text-lg mr-1 font-bold">R$</span>
                   {Number(item.custo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </p>
               </div>
               <div className="bg-red-600 p-4 rounded-2xl text-white shadow-lg">
                 <DollarSign size={28} />
               </div>
            </div>

            <div className="md:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-center">
              {tanqueImagem ? (
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-2">Tanque</p>
                  <img src={`/tanque/${tanqueImagem}`} alt="Nível" className="max-h-16 object-contain" />
                </div>
              ) : (
                <p className="text-[10px] font-black text-slate-300 uppercase text-center">Foto N/D</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Info size={16} className="text-blue-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações e Anotações</span>
            </div>
            <div className="text-slate-600 font-bold italic leading-relaxed text-sm md:text-base whitespace-pre-line">
              {limparObservacoes(item.observacoes) || "Nenhuma observação registrada."}
            </div>
          </div>

          <button onClick={fechar} className="bg-slate-900 text-white w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-95 mb-2 cursor-pointer">
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalhes;