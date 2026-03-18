import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import Formulario from './components/Formulario';
import ListaCategoria from './components/ListaCategoria';
import ModalEdit from './components/ModalEdit';
import ResumoFinanceiro from './components/ResumoFinanceiro';
import ListaCliente from './components/cliente/ListaCliente';
import ModalDetalhes from './components/cliente/ModalDetalhes';

function App() {
  const [registros, setRegistros] = useState(() => {
    const salvo = localStorage.getItem('registros_montecristo');
    return salvo ? JSON.parse(salvo) : [];
  });

  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const [form, setForm] = useState({ 
    nome: '', 
    motorista: '', 
    tipo: 'Diesel', 
    categoria: 'Máquina', 
    valor: 0, 
    litros: 0, 
    precoLitro: 0,
    observacoes: '' 
  });

  useEffect(() => {
    localStorage.setItem('registros_montecristo', JSON.stringify(registros));
  }, [registros]);

  const adicionar = (e) => {
    e.preventDefault();
    const custo = Number(form.litros) * Number(form.precoLitro);
    setRegistros([...registros, { ...form, id: Date.now(), custo }]);
    setForm({ ...form, nome: '', motorista: '', valor: 0, litros: 0, precoLitro: 0, observacoes: '' });
  };

  const remover = (id) => setRegistros(registros.filter(r => r.id !== id));
  const formatarMoedaBR = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const abrirEdicao = (item) => {
    setItemEditando({ ...item, observacoes: item.observacoes || "" });
    setIsModalOpen(true);
  };

  const salvarEdicao = () => {
    setRegistros(registros.map(r => r.id === itemEditando.id ? { 
      ...itemEditando, 
      custo: Number(itemEditando.litros) * Number(itemEditando.precoLitro),
      valor: Number(itemEditando.valor), 
      litros: Number(itemEditando.litros), 
      precoLitro: Number(itemEditando.precoLitro),
      observacoes: itemEditando.observacoes 
    } : r));
    setIsModalOpen(false);
  };

  const totalGeral = registros.reduce((acc, curr) => acc + Number(curr.custo || 0), 0);
  const totalLiters = registros.reduce((acc, curr) => acc + Number(curr.litros || 0), 0);
  const litrosDiesel = registros.filter(r => r.tipo === 'Diesel').reduce((a, b) => a + Number(b.litros || 0), 0);
  const litrosGasolina = registros.filter(r => r.tipo === 'Gasolina').reduce((a, b) => a + Number(b.litros || 0), 0);
  const custoDiesel = registros.filter(r => r.tipo === 'Diesel').reduce((a, b) => a + Number(b.custo || 0), 0);
  const custoGasolina = registros.filter(r => r.tipo === 'Gasolina').reduce((a, b) => a + Number(b.custo || 0), 0);
  const percDiesel = totalLiters ? (litrosDiesel / totalLiters) * 100 : 50;

  return (
    <Router>
      <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] font-sans text-left">
        <Routes>
          <Route path="/" element={
            <div className="p-4 md:p-10 space-y-6 max-w-9xl mx-auto">
              <div id="print-area" className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-10 text-white flex justify-between items-center">
                  <div className="flex items-center gap-6"> 
                    <img src="./company_2.png" alt="Logo" className="w-16 h-16 object-contain" />
                    <div>
                      <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter">Relatório Monte Cristo</h2>
                      <div className="flex items-center gap-2 mt-2 text-red-500 font-bold uppercase text-xs tracking-[0.3em]">
                        <TrendingUp size={14}/> Controle de Frota Ativo
                      </div>
                    </div>
                  </div>
                  <div className="text-right bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Custo Semanal</p>
                    <p className="text-3xl font-black text-red-500">R$ {formatarMoedaBR(totalGeral)}</p>
                  </div>
                </div>

                <div className="p-8 md:p-12">
                  <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <ListaCliente titulo="Máquinas" icone="🚜" corBarra="border-orange-500" itens={registros.filter(r => r.categoria === 'Máquina')} aoSelecionar={setItemSelecionado} />
                    <ListaCliente titulo="Caminhões" icone="🚛" corBarra="border-green-600" itens={registros.filter(r => r.categoria === 'Caminhão')} aoSelecionar={setItemSelecionado} />
                    <ListaCliente titulo="Veículos" icone="🚗" corBarra="border-blue-600" itens={registros.filter(r => r.categoria === 'Veículo')} aoSelecionar={setItemSelecionado} />
                  </div>
                  
                  <ResumoFinanceiro 
                    litrosDiesel={litrosDiesel} litrosGasolina={litrosGasolina} percDiesel={percDiesel} 
                    custoDiesel={custoDiesel} custoGasolina={custoGasolina} formatarMoedaBR={formatarMoedaBR} 
                  />
                </div>
              </div>
            </div>
          } />

          <Route path="/admin" element={
            <div className="p-4 md:p-10 space-y-6 max-w-9xl mx-auto">
              <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                <h1 className="font-black uppercase tracking-widest text-sm">Painel Administrativo - Monte Cristo</h1>
                <a href="/" className="bg-red-600 px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-red-700 transition-all">Sair do Painel</a>
              </div>

              <Formulario form={form} setForm={setForm} adicionar={adicionar} />

              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-10 text-white flex justify-between items-center">
                  <div className="flex items-center gap-6"> 
                    <img src="./company_2.png" alt="Logo" className="w-16 h-16 object-contain" />
                    <div>
                      <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter">Gestão de Frota Ativa</h2>
                      <div className="flex items-center gap-2 mt-2 text-red-500 font-bold uppercase text-xs tracking-[0.3em]">
                        <TrendingUp size={14}/> Dashboard Administrativo
                      </div>
                    </div>
                  </div>
                  <div className="text-right bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Custo Total Acumulado</p>
                    <p className="text-3xl font-black text-red-500 font-mono">R$ {formatarMoedaBR(totalGeral)}</p>
                  </div>
                </div>

                <div className="p-8 md:p-12">
                    <div className="grid md:grid-cols-3 gap-8 mb-12 pb-12 border-b border-slate-100">
                      <ListaCategoria titulo="Máquinas" icone="🚜" corBarra="border-orange-500" itens={registros.filter(r => r.categoria === 'Máquina')} abrirEdicao={abrirEdicao} remover={remover} />
                      <ListaCategoria titulo="Caminhões" icone="🚛" corBarra="border-green-600" itens={registros.filter(r => r.categoria === 'Caminhão')} abrirEdicao={abrirEdicao} remover={remover} />
                      <ListaCategoria titulo="Veículos" icone="🚗" corBarra="border-blue-600" itens={registros.filter(r => r.categoria === 'Veículo')} abrirEdicao={abrirEdicao} remover={remover} />
                    </div>

                    <ResumoFinanceiro 
                      litrosDiesel={litrosDiesel} 
                      litrosGasolina={litrosGasolina} 
                      percDiesel={percDiesel} 
                      custoDiesel={custoDiesel} 
                      custoGasolina={custoGasolina} 
                      formatarMoedaBR={formatarMoedaBR} 
                    />
                </div>
              </div>,
            </div>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <ModalEdit isOpen={isModalOpen} item={itemEditando} setItem={setItemEditando} salvar={salvarEdicao} fechar={() => setIsModalOpen(false)} />
        <ModalDetalhes item={itemSelecionado} fechar={() => setItemSelecionado(null)} />
      </div>
    </Router>
  );
}

export default App;