import React from 'react';
import { Fuel, Download } from 'lucide-react';

const Header = ({ gerarPDF }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-4">
      <div className="flex items-center gap-4 text-left">
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
      <button onClick={gerarPDF} className="bg-[#0F172A] hover:bg-black text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl active:scale-95 uppercase text-xs tracking-widest">
        <Download size={18}/> Gerar Relatório
      </button>
    </div>
  );
};

export default Header;