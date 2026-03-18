import React from 'react';

const ListaCliente = ({ titulo, icone, corBarra, itens, aoSelecionar }) => {
  const maiorCusto = Math.max(...itens.map(i => Number(i.custo)), 1);
  
  const coresBackground = {
    'border-orange-500': 'bg-orange-500',
    'border-green-600': 'bg-green-600',
    'border-blue-600': 'bg-blue-500',
  };

  const corBG = coresBackground[corBarra] || 'bg-slate-400';
  const itensOrdenados = [...itens].sort((a, b) => Number(b.valor) - Number(a.valor));

  return (
    <div className="space-y-8">
      <h3 className={`font-black text-slate-800 uppercase italic border-b-4 ${corBarra}/20 pb-2 flex items-center gap-2`}>
        <span className="text-xl">{icone}</span> {titulo}
      </h3>
      <div className="space-y-6">
        {itensOrdenados.map(item => {
          const larguraBarra = (Number(item.custo) / maiorCusto) * 100;
          const unidade = item.categoria === 'Máquina' ? 'h' : 'km';
          const consumoSufixo = item.categoria === 'Máquina' ? 'L/h' : 'km/L';
          const consumo = item.categoria === 'Máquina' 
            ? (item.valor > 0 ? (item.litros / item.valor).toFixed(2) : 0)
            : (item.litros > 0 ? (item.valor / item.litros).toFixed(2) : 0);

          return (
            <div 
              key={item.id} 
              className="group flex flex-col gap-1 cursor-pointer hover:scale-[1.02] transition-all active:scale-95"
              onClick={() => aoSelecionar(item)}
            >
              <span className="font-black text-slate-700 text-[12px] uppercase">
                {item.nome} <span className="text-slate-400 font-bold ml-1">- {item.motorista}</span>
              </span>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 h-10 rounded-lg relative overflow-hidden shadow-sm border border-slate-200">
                  <div className={`h-full ${corBG} transition-all duration-500`} style={{ width: `${larguraBarra}%` }}></div>
                  <span className="text-[14px] absolute inset-0 flex items-center justify-end pr-4 font-black text-slate-800 italic">
                    {item.valor}{unidade} | {item.litros}L | {consumo}{consumoSufixo} | R$ {Number(item.custo).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListaCliente;