import React, { useState, useEffect } from 'react';
import { Fuel, Truck, HardHat, Download, Plus, Trash2, TrendingUp, PieChart as PieIcon, Edit3, X, Check, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function App() {
  const PRECO_GASOLINA = 6.15;
  const PRECO_DIESEL = 5.79;

  const [registros, setRegistros] = useState(() => {
    const salvo = localStorage.getItem('registros_montecristo');
    return salvo ? JSON.parse(salvo) : [];
  });

  const [form, setForm] = useState({ nome: '', tipo: 'Diesel', categoria: 'Máquina', valor: 0, litros: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  useEffect(() => {
    localStorage.setItem('registros_montecristo', JSON.stringify(registros));
  }, [registros]);

  const adicionar = (e) => {
    e.preventDefault();
    const custo = form.tipo === 'Gasolina' ? form.litros * PRECO_GASOLINA : form.litros * PRECO_DIESEL;
    setRegistros([...registros, { ...form, id: Date.now(), custo }]);
    setForm({ ...form, nome: '', valor: 0, litros: 0 });
  };

  const remover = (id) => setRegistros(registros.filter(r => r.id !== id));

  const abrirEdicao = (item) => {
    setItemEditando({ ...item });
    setIsModalOpen(true);
  };

  const salvarEdicao = () => {
    const novaLista = registros.map(r => r.id === itemEditando.id ? { ...itemEditando, custo: Number(itemEditando.custo) } : r);
    setRegistros(novaLista);
    setIsModalOpen(false);
  };

  const maquinas = registros.filter(r => r.categoria === 'Máquina');
  const veiculos = registros.filter(r => r.categoria === 'Veículo');
  
  const totalGeral = registros.reduce((acc, curr) => acc + Number(curr.custo || 0), 0);
  const totalLiters = registros.reduce((acc, curr) => acc + Number(curr.litros || 0), 0);
  
  const litrosDiesel = registros.filter(r => r.tipo === 'Diesel').reduce((a, b) => a + Number(b.litros || 0), 0);
  const litrosGasolina = registros.filter(r => r.tipo === 'Gasolina').reduce((a, b) => a + Number(b.litros || 0), 0);
  
  const custoDiesel = registros.filter(r => r.tipo === 'Diesel').reduce((a, b) => a + Number(b.custo || 0), 0);
  const custoGasolina = registros.filter(r => r.tipo === 'Gasolina').reduce((a, b) => a + Number(b.custo || 0), 0);

  const percDiesel = totalLiters ? (litrosDiesel / totalLiters) * 100 : 50;

  const gerarPDF = () => {
    const input = document.getElementById('print-area');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, 'PNG', 0, 0, width, (canvas.height * width) / canvas.width);
      pdf.save("Relatorio_MonteCristo.pdf");
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] p-4 md:p-10 font-sans relative">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
              <div className="p-2 bg-white">
                <img src="./company_2.png" alt="Logo" className="w-10 h-10 object-contain" onError={(e) => e.target.style.display = 'none'} />
              </div>
              <div className="bg-red-600 p-3 self-stretch flex items-center">
                <Fuel size={24} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none uppercase">MONTE<span className="text-red-600">CRISTO</span></h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Painel de Controle</p>
            </div>
          </div>
          <button onClick={gerarPDF} className="w-full md:w-auto bg-[#0F172A] hover:bg-black text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 uppercase text-xs tracking-widest text-center">
            <Download size={18}/> Gerar Relatório
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-left">
          <form onSubmit={adicionar} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Identificação</label>
              <input required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" placeholder="Prefixo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value.toUpperCase()})}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Categoria</label>
              <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold outline-none cursor-pointer" value={form.categoria} 
                onChange={e => setForm({...form, categoria: e.target.value, tipo: e.target.value === 'Máquina' ? 'Diesel' : 'Gasolina'})}>
                <option value="Máquina">🏗️ Máquina</option>
                <option value="Veículo">🚚 Veículo</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider text-blue-600">Uso (h/km)</label>
              <input type="number" step="any" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-blue-600" 
                value={form.valor || ''} onChange={e => setForm({...form, valor: e.target.value})}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider text-green-600">Abastecimento (Lts)</label>
              <input type="number" step="any" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-green-600" 
                value={form.litros || ''} onChange={e => setForm({...form, litros: e.target.value})}/>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
              Lançar
            </button>
          </form>
        </div>

        <div id="print-area" className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-10 text-white flex justify-between items-center text-left">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">Relatório Semanal</h2>
              <div className="flex items-center gap-2 mt-2 text-red-500 font-bold uppercase text-xs tracking-[0.3em]">
                <TrendingUp size={14}/> Monte Cristo Operações
              </div>
            </div>
            <div className="text-right bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Acumulado</p>
              <p className="text-3xl font-black text-red-500">R$ {totalGeral.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12 relative text-left text-sm font-bold">
            <div className="space-y-8">
              <h3 className="font-black text-slate-800 uppercase italic border-b-4 border-orange-500/20 pb-2 flex items-center gap-2">
                <HardHat className="text-orange-500" size={18} /> Operação Máquinas
              </h3>
              <div className="space-y-6">
                {maquinas.map(m => (
                  <div key={m.id} className="group flex items-center gap-4">
                    <span className="w-12 font-black text-slate-400 text-[10px]">{m.nome}</span>
                    <div className="flex-1 bg-slate-100 h-8 rounded-lg relative overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all" style={{width: `${Math.min(m.valor, 100)}%`}}></div>
                      <span className="absolute inset-0 flex items-center justify-end pr-3 text-[10px] font-black text-slate-700 italic">{m.valor}h | R$ {Number(m.custo).toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 text-slate-300">
                      <button onClick={() => abrirEdicao(m)} className="hover:text-blue-500 transition"><Edit3 size={16}/></button>
                      <button onClick={() => remover(m.id)} className="hover:text-red-500 transition"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="font-black text-slate-800 uppercase italic border-b-4 border-blue-600/20 pb-2 flex items-center gap-2">
                <Truck className="text-blue-600" size={18} /> Rodagem Veículos
              </h3>
              <div className="grid gap-3">
                {veiculos.map(v => (
                  <div key={v.id} className="group flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl hover:bg-white hover:shadow-xl transition-all">
                    <span className="font-black text-slate-700 italic text-sm">{v.nome}</span>
                    <div className="flex items-center gap-4">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-black text-[10px] italic">{v.valor} KM | R$ {Number(v.custo).toFixed(2)}</span>
                      <div className="flex gap-2 text-slate-300">
                        <button onClick={() => abrirEdicao(v)} className="hover:text-blue-500 transition"><Edit3 size={16}/></button>
                        <button onClick={() => remover(v.id)} className="hover:text-red-500 transition"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 border-t-2 border-slate-100 pt-10 grid md:grid-cols-3 gap-8 items-center text-center md:text-left">
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border-l-4 border-blue-500 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Diesel Total (Lts)</span>
                  <span className="font-black text-xl">{litrosDiesel.toFixed(1)} L</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border-l-4 border-green-500 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Gasolina Total (Lts)</span>
                  <span className="font-black text-xl">{litrosGasolina.toFixed(1)} L</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-32 h-32 rounded-full shadow-2xl flex items-center justify-center relative border-8 border-white"
                  style={{ background: `conic-gradient(#3b82f6 0% ${percDiesel}%, #22c55e ${percDiesel}% 100%)` }}>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <PieIcon size={20} className="text-slate-200"/>
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-2">DIESEL X GASOLINA</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border-l-4 border-red-500 shadow-lg border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Diesel (R$)</span>
                  <span className="font-black text-xl text-red-600">R$ {custoDiesel.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border-l-4 border-red-600 shadow-lg border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Gasolina (R$)</span>
                  <span className="font-black text-xl text-red-600">R$ {custoGasolina.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && itemEditando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in duration-200 text-left">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Editar Registro</h3>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{itemEditando.nome}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest flex items-center gap-1">
                  <DollarSign size={12}/> VALOR TOTAL EM DINHEIRO (R$)
                </label>
                <input 
                  type="number" 
                  step="0.001" 
                  className="w-full bg-red-50 border border-red-100 p-4 rounded-2xl outline-none font-black text-2xl text-center text-red-600 focus:ring-2 focus:ring-red-500" 
                  value={itemEditando.custo} 
                  onChange={e => setItemEditando({...itemEditando, custo: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Uso</label>
                  <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-blue-600 text-center" 
                    value={itemEditando.valor} onChange={e => setItemEditando({...itemEditando, valor: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Litros</label>
                  <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-green-600 text-center" 
                    value={itemEditando.litros} onChange={e => setItemEditando({...itemEditando, litros: e.target.value})}/>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-400 uppercase text-xs tracking-widest">Cancelar</button>
                <button onClick={salvarEdicao} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black shadow-lg hover:bg-red-700 transition flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                  <Check size={18} /> Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;