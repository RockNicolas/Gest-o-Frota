import React from 'react';

const ResumoFinanceiro = ({ 
  mediasCategoria,
  litrosDiesel, 
  litrosGasolina, 
  percDiesel, 
  custoDiesel, 
  custoGasolina, 
  formatarMoedaBR 
}) => {
  return (
    <div className="border-t-2 border-slate-100 pt-8 md:pt-10 space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {mediasCategoria.map((item) => (
          <div key={item.categoria} className="bg-white border border-slate-200 rounded-[1.75rem] p-5 shadow-lg text-left">
            <p className="text-[15px] font-black text-slate-900 uppercase tracking-[0.2em]">Média por {item.unidadeUso}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <h4 className="text-sm font-black uppercase text-slate-800">{item.titulo}</h4>
                <p className="text-3xl font-black text-slate-900 leading-none mt-2">
                  {item.media.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-sm text-slate-500 ml-2">{item.unidadeMedia}</span>
                </p>
              </div>
              <span className="text-[18px] font-black uppercase text-slate-400 whitespace-nowrap">{item.quantidade} registro(s)</span>
            </div>
            <p className="text-[20px] font-bold text-slate-500 mt-3">
              Base acumulada: {item.totalUso.toLocaleString('pt-BR', { minimumFractionDigits: item.categoria === 'Máquina' ? 2 : 0, maximumFractionDigits: 2 })} {item.unidadeUso}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center text-center">
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-3 bg-slate-50 p-4 rounded-2xl border-l-4 border-[#f97316] shadow-sm text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Diesel (Lts)</span>
            <span className="font-black text-lg md:text-xl flex-1 text-right">
              {litrosDiesel.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} L
            </span>
          </div>
          <div className="flex justify-between items-center gap-3 bg-slate-50 p-4 rounded-2xl border-l-4 border-blue-500 shadow-sm text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Gasolina (Lts)</span>
            <span className="font-black text-lg md:text-xl flex-1 text-right">
              {litrosGasolina.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} L
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 order-first md:order-none">
          <div 
            className="w-28 h-28 md:w-32 md:h-32 rounded-full shadow-xl flex items-center justify-center relative border-4 border-white"
            style={{ background: `conic-gradient(#f97316 0% ${percDiesel}%, #2563eb ${percDiesel}% 100%)` }}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner text-[10px] font-black">LTS</div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase mt-2 italic">DIESEL X GASOLINA</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center gap-3 bg-white p-4 rounded-2xl border-l-4 border-red-500 shadow-lg border border-slate-100 text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase">Custo Diesel</span>
            <span className="font-black text-lg md:text-xl text-red-600 text-right">R$ {formatarMoedaBR(custoDiesel)}</span>
          </div>
          <div className="flex justify-between items-center gap-3 bg-white p-4 rounded-2xl border-l-4 border-red-600 shadow-lg border border-slate-100 text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase">Custo Gasolina</span>
            <span className="font-black text-lg md:text-xl text-red-600 text-right">R$ {formatarMoedaBR(custoGasolina)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoFinanceiro;