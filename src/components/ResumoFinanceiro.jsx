import React, { useState } from 'react';

const ResumoFinanceiro = ({ 
  mediasCategoria,
  litrosDiesel, 
  litrosGasolina, 
  percDiesel, 
  custoDiesel, 
  custoGasolina, 
  formatarMoedaBR 
}) => {
  const [hoverInfo, setHoverInfo] = useState(null);

  const handleDonutMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const distance = Math.sqrt(x * x + y * y);
    const outerRadius = rect.width / 2;
    const innerRadius = outerRadius * 0.45;

    if (distance >= innerRadius && distance <= outerRadius) {
      const deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
      const angleClockwiseFromTop = (deg + 90) % 360;
      const dieselPercent = Number(percDiesel) || 0;
      const dieselDegrees = dieselPercent * 3.6;
      const isDiesel = angleClockwiseFromTop < dieselDegrees;
      const label = isDiesel ? 'Diesel' : 'Gasolina';
      const value = isDiesel ? dieselPercent : 100 - dieselPercent;
      setHoverInfo({ label, value });
    } else {
      setHoverInfo(null);
    }
  };

  const handleDonutMouseLeave = () => setHoverInfo(null);

  const dieselPercentText = `${Number(percDiesel).toFixed(1)}%`;
  const gasolinaPercentText = `${(100 - Number(percDiesel)).toFixed(1)}%`;

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

        <div className="flex flex-col md:flex-row items-center gap-4 order-first md:order-none">
          <div 
            className="w-40 h-40 md:w-48 md:h-48 rounded-full shadow-2xl flex items-center justify-center relative border-4 border-white cursor-pointer"
            style={{ background: `conic-gradient(#f97316 0% ${percDiesel}%, #2563eb ${percDiesel}% 100%)` }}
            onMouseMove={handleDonutMouseMove}
            onMouseLeave={handleDonutMouseLeave}
            aria-label={`Gráfico Diesel ${dieselPercentText} e Gasolina ${gasolinaPercentText}`}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-inner text-[12px] md:text-sm font-black text-slate-900">
              LTS
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <p className="text-[11px] md:text-xs font-black text-slate-400 uppercase italic">DIESEL X GASOLINA</p>
            <div className="min-w-[140px] bg-slate-900 text-white text-[12px] md:text-sm font-bold px-3 py-3 rounded-2xl shadow-lg transition-all duration-200">
              {hoverInfo ? (
                <span>{hoverInfo.label}: {hoverInfo.value.toFixed(1)}%</span>
              ) : (
                <span className="text-slate-300">Passe o mouse sobre o gráfico</span>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-2 text-left">
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="w-3 h-3 rounded-full bg-[#f97316] block" />
                <span className="font-bold">Diesel {dieselPercentText}</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="w-3 h-3 rounded-full bg-[#2563eb] block" />
                <span className="font-bold">Gasolina {gasolinaPercentText}</span>
              </div>
            </div>
          </div>
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