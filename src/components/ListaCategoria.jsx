import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const obterLitrosCalculo = (item) => {
  const texto = String(item.observacoes || '');
  const match = texto.match(/\[\[LITROS_CALC:([0-9.,]+)\]\]/);
  if (!match) return Number(item.litros || 0);
  const valor = Number(String(match[1]).replace(',', '.'));
  return Number.isFinite(valor) ? valor : Number(item.litros || 0);
};

const formatarUso = (item) => {
  const valor = Number(item.valor || 0);
  if (item.categoria === 'Máquina') {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
};

const ListaCategoria = ({ titulo, icone, corBarra, itens, modoBarra = 'valor', abrirEdicao, remover }) => {
  const maiorEscala = Math.max(...itens.map(i => Number(modoBarra === 'valor' ? i.valor : i.custo)), 1);
  
  const coresBackground = {
    'border-orange-500': 'bg-orange-500',
    'border-green-600': 'bg-green-600',
    'border-blue-600': 'bg-blue-500',
  };

  const corBG = coresBackground[corBarra] || 'bg-slate-400';
  const itensOrdenados = [...itens].sort((a, b) => {
    if (modoBarra === 'custo') {
      return Number(b.custo) - Number(a.custo);
    }
    return Number(b.valor) - Number(a.valor);
  });

  return (
    <div className="space-y-8">
      <h3 className={`font-black text-slate-800 uppercase italic border-b-4 ${corBarra} pb-2 flex items-center gap-2`}>
        <span className="text-xl">{icone}</span> {titulo}
      </h3>
      <div className="space-y-6">
        {itensOrdenados.map(item => {
          const larguraBarra = (Number(modoBarra === 'valor' ? item.valor : item.custo) / maiorEscala) * 100;
          const unidade = item.categoria === 'Máquina' ? 'h' : 'km';
          const consumoSufixo = item.categoria === 'Máquina' ? 'L/h' : 'km/L';
          const litrosCalculo = obterLitrosCalculo(item);
          const consumo = item.categoria === 'Máquina' 
            ? (item.valor > 0 ? (litrosCalculo / item.valor).toFixed(2) : 0)
            : (litrosCalculo > 0 ? (item.valor / litrosCalculo).toFixed(2) : 0);

          return (
            <div key={item.id} className="group flex flex-col gap-1 cursor-pointer hover:-translate-y-0.5 transition-all duration-200">
              <span className="font-black text-slate-900 text-[18px] uppercase">
                {item.nome} <span className="text-slate-400 font-bold ml-1">- {item.motorista}</span>
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 bg-slate-100 min-h-12 sm:h-10 rounded-lg relative overflow-hidden shadow-sm border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-500 ${corBG}`} 
                    style={{ width: `${larguraBarra}%` }}
                  ></div>
                  <span className="hidden sm:flex text-[12px] lg:text-[14px] absolute inset-0 items-center justify-end pr-4 font-black text-slate-800 italic">
                    {formatarUso(item)}{unidade} | {item.litros}L | {consumo}{consumoSufixo} | R$ {Number(item.custo).toFixed(2)}
                  </span>
                </div>
                <div className="sm:hidden text-[12px] font-black text-slate-700 italic bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  {formatarUso(item)}{unidade} | {item.litros}L | {consumo}{consumoSufixo} | R$ {Number(item.custo).toFixed(2)}
                </div>
                <div className="flex gap-1 text-black self-end sm:self-auto">
                  <button onClick={() => abrirEdicao(item)} className="hover:text-blue-500"><Edit3 size={20}/></button>
                  <button onClick={() => remover(item.id)} className="hover:text-red-500"><Trash2 size={20}/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListaCategoria;