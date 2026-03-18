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
        
      </div>
      
    </div>
  );
};

export default Header;