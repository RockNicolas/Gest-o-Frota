import React from 'react';
import { X, Check, DollarSign } from 'lucide-react';

const ModalEdit = ({ isOpen, item, setItem, salvar, fechar }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 text-left">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black uppercase italic tracking-tighter">Editar Registro</h3>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{item.nome}</p>
          </div>
          <button onClick={fechar}><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest flex items-center gap-1"><DollarSign size={12}/> Motorista</label>
            <input className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-black text-slate-700" value={item.motorista} onChange={e => setItem({...item, motorista: e.target.value.toUpperCase() })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-blue-600 text-center" value={item.valor} onChange={e => setItem({...item, valor: e.target.value})}/>
            <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-green-600 text-center" value={item.litros} onChange={e => setItem({...item, litros: e.target.value})}/>
            <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-red-600 text-center" value={item.precoLitro} onChange={e => setItem({...item, precoLitro: e.target.value})}/>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={fechar} className="flex-1 py-3 font-bold text-slate-400 uppercase text-xs tracking-widest">Cancelar</button>
            <button onClick={salvar} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black shadow-lg hover:bg-red-700 transition flex items-center justify-center gap-2 uppercase text-xs tracking-widest"><Check size={18} /> Salvar</button>
          </div>
            <textarea 
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-bold text-slate-700 h-32 resize-none shadow-inner italic"
            value={item.observacoes || ""}
            onChange={e => setItem({...item, observacoes: e.target.value})}
            />
        </div>
      </div>
    </div>
  );
};

export default ModalEdit;