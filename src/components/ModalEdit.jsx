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

  const periodoCadastro = item.periodo === 'mensal' ? 'mensal' : 'semanal';
  const isMensalCadastro = periodoCadastro === 'mensal';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
      <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-2xl w-full max-w-md md:max-w-2xl max-h-[92vh] overflow-hidden border border-slate-200 text-left flex flex-col">
        <div className="bg-slate-900 p-4 md:p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">Editar Registro</h3>
            <p className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">{item.nome}</p>
          </div>
          <button onClick={fechar} className="cursor-pointer bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-4 md:p-6 space-y-5 md:space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 md:mb-3 block tracking-widest flex items-center gap-2"><DollarSign size={13}/> Motorista</label>
              <input className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-bold text-slate-700 text-sm md:text-base" value={item.motorista} onChange={e => setItem({...item, motorista: e.target.value.toUpperCase() })} />
            </div>
            <div></div>
          </div>
          <div>
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
              Período do cadastro
            </label>
            <select
              value={periodoCadastro}
              onChange={(e) => setItem({ ...item, periodo: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl md:rounded-2xl font-bold text-slate-800 text-sm md:text-base cursor-pointer"
            >
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Uso (Valor)</label>
              <input type="number" step="any" className="w-full bg-blue-50 border border-blue-200 p-3 md:p-4 rounded-xl md:rounded-2xl font-bold text-blue-600 text-center text-sm md:text-base" value={item.valor} onChange={e => setItem({...item, valor: e.target.value})}/>
            </div>
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Volume (Litros)</label>
              <input type="number" step="any" className="w-full bg-green-50 border border-green-200 p-3 md:p-4 rounded-xl md:rounded-2xl font-bold text-green-600 text-center text-sm md:text-base" value={item.litros} onChange={e => setItem({...item, litros: e.target.value})}/>
            </div>
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Custo Total</label>
              <input type="number" step="any" className="w-full bg-red-50 border border-red-200 p-3 md:p-4 rounded-xl md:rounded-2xl font-bold text-red-600 text-center text-sm md:text-base" value={item.custo} onChange={e => setItem({...item, custo: e.target.value})}/>
            </div>
          </div>
          {!isMensalCadastro ? (
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 md:mb-3 tracking-widest">Tanque antes do abastecimento</p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {OPCOES_TANQUE.map((opcao) => {
                  const selecionada = item.tanqueAntesImagem === opcao.id;
                  return (
                    <button
                      key={opcao.id}
                      type="button"
                      onClick={() => setItem({ ...item, tanqueAntesImagem: opcao.id })}
                      className={`cursor-pointer px-3 py-2 rounded-lg md:rounded-xl border text-[9px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${selecionada ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      <span className={`w-2 md:w-2.5 h-2 md:h-2.5 rounded-full ${selecionada ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                      {opcao.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div>
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 md:mb-3 block tracking-widest">Observações e Anotações</label>
            <textarea 
            className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-bold text-slate-700 h-32 md:h-40 resize-none shadow-inner italic text-sm"
            value={item.observacoes || ""}
            onChange={e => setItem({...item, observacoes: e.target.value})}
            placeholder="Adicione anotações..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-3 md:pt-4 border-t border-slate-100">
            <button onClick={fechar} className="cursor-pointer flex-1 py-3 md:py-4 font-black text-slate-600 uppercase text-xs md:text-sm tracking-widest hover:bg-slate-100 rounded-lg md:rounded-xl transition">Cancelar</button>
            <button onClick={salvar} className="cursor-pointer flex-1 bg-red-600 text-white py-3 md:py-4 rounded-lg md:rounded-xl font-black shadow-lg hover:bg-red-700 transition flex items-center justify-center gap-2 uppercase text-xs md:text-sm tracking-widest"><Check size={18} /> Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEdit;