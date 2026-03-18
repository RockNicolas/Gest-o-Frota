import React from 'react';

const Formulario = ({ form, setForm, adicionar }) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <form onSubmit={adicionar} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Identificação</label>
          <input required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" placeholder="Prefixo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value.toUpperCase()})}/>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Motorista</label>
          <input required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" placeholder="Nome" value={form.motorista} onChange={e => setForm({...form, motorista: e.target.value.toUpperCase()})}/>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Categoria</label>
          <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold outline-none cursor-pointer" value={form.categoria} 
            onChange={e => {
              const cat = e.target.value;
              const tipoAuto = (cat === 'Máquina' || cat === 'Caminhão') ? 'Diesel' : 'Gasolina';
              setForm({...form, categoria: cat, tipo: tipoAuto});
            }}>
            <option value="Máquina">🚜 Máquina (Diesel)</option>
            <option value="Caminhão">🚛 Caminhão (Diesel)</option>
            <option value="Veículo">🚗 Veículo (Gasolina)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider text-blue-600">Uso (h/km)</label>
          <input type="number" step="any" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-blue-600" value={form.valor || ''} onChange={e => setForm({...form, valor: e.target.value})}/>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider text-green-600">Abastecimento (Lts)</label>
          <input type="number" step="any" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-green-600" value={form.litros || ''} onChange={e => setForm({...form, litros: e.target.value})}/>
        </div>
        <div>
          <label className="text-[10px] font-black text-red-600 uppercase mb-2 block tracking-wider">Preço Litro (R$)</label>
          <input type="number" step="any" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-red-600" placeholder="0,00" value={form.precoLitro || ''} onChange={e => setForm({...form, precoLitro: e.target.value})}/>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all uppercase text-[10px] tracking-widest">Lançar</button>
      </form>
    </div>
  );
};

export default Formulario;