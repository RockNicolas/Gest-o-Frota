import React from 'react';

const ResumoFinanceiro = ({ 
  litrosDiesel, 
  litrosGasolina, 
  percDiesel, 
  custoDiesel, 
  custoGasolina, 
  formatarMoedaBR 
}) => {
  return (
    <div className="md:col-span-3 border-t-2 border-slate-100 pt-10 grid md:grid-cols-3 gap-8 items-center text-center">
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border-l-4 border-[#f97316] shadow-sm text-left">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Diesel (Lts)</span>
          <span className="font-black text-xl flex-1 text-right">
            {litrosDiesel.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} L
          </span>
        </div>
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border-l-4 border-blue-500 shadow-sm text-left">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Gasolina (Lts)</span>
          <span className="font-black text-xl flex-1 text-right">
            {litrosGasolina.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} L
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div 
          className="w-32 h-32 rounded-full shadow-xl flex items-center justify-center relative border-4 border-white"
          style={{ background: `conic-gradient(#f97316 0% ${percDiesel}%, #2563eb ${percDiesel}% 100%)` }}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner text-[10px] font-black">LTS</div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase mt-2 italic">DIESEL X GASOLINA</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border-l-4 border-red-500 shadow-lg border border-slate-100 text-left">
          <span className="text-[10px] font-black text-slate-400 uppercase">Custo Diesel</span>
          <span className="font-black text-xl text-red-600">R$ {formatarMoedaBR(custoDiesel)}</span>
        </div>
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border-l-4 border-red-600 shadow-lg border border-slate-100 text-left">
          <span className="text-[10px] font-black text-slate-400 uppercase">Custo Gasolina</span>
          <span className="font-black text-xl text-red-600">R$ {formatarMoedaBR(custoGasolina)}</span>
        </div>
      </div>

    </div>
  );
};

export default ResumoFinanceiro;