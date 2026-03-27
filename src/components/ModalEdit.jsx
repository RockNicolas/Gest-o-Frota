import React from 'react';
import { X, Check, DollarSign } from 'lucide-react';

const OPCOES_TANQUE = [
  { id: 'reserva.png', label: 'Reserva' },
  { id: '1-4.png', label: '1/4' },
  { id: '1-2.png', label: '1/2' },
  { id: '3-4.png', label: '3/4' },
];

const ModalEdit = ({ isOpen, item, setItem, salvar, fechar }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-slate-200 text-left flex flex-col">
        <div className="bg-slate-900 p-4 md:p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-black uppercase italic tracking-tighter">Editar Registro</h3>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{item.nome}</p>
          </div>
          <button onClick={fechar}><X size={20} /></button>
        </div>
        <div className="p-4 md:p-8 space-y-6 overflow-y-auto">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest flex items-center gap-1"><DollarSign size={12}/> Motorista</label>
            <input className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-black text-slate-700" value={item.motorista} onChange={e => setItem({...item, motorista: e.target.value.toUpperCase() })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-blue-600 text-center" value={item.valor} onChange={e => setItem({...item, valor: e.target.value})}/>
            <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-green-600 text-center" value={item.litros} onChange={e => setItem({...item, litros: e.target.value})}/>
            <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-red-600 text-center" value={item.custo} onChange={e => setItem({...item, custo: e.target.value})}/>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Tanque antes do abastecimento</p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {OPCOES_TANQUE.map((opcao) => {
                const selecionada = item.tanqueAntesImagem === opcao.id;
                return (
                  <button
                    key={opcao.id}
                    type="button"
                    onClick={() => setItem({ ...item, tanqueAntesImagem: opcao.id })}
                    className={`px-3 py-2 rounded-xl border text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${selecionada ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${selecionada ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                    {opcao.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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