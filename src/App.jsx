import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FleetProvider } from './context/FleetContext';
import ModalEdit from './components/ModalEdit';
import ModalDetalhes from './components/cliente/ModalDetalhes';
import ClienteHomePage from './pages/ClienteHomePage';
import LoginPage from './pages/LoginPage';
import CadastroContaPage from './pages/CadastroContaPage';
import RequireAuth from './pages/admin/RequireAuth';
import AdminLayout from './pages/admin/AdminLayout';
import AdminCadastroPage from './pages/admin/AdminCadastroPage';
import RedirectDashboardToCadastro from './pages/admin/RedirectDashboardToCadastro';
import AdminSalvosPage from './pages/admin/AdminSalvosPage';
import { useFleet } from './context/FleetContext';

function ModaisGlobais() {
  const { isModalOpen, itemEditando, setItemEditando, salvarEdicao, setIsModalOpen, itemSelecionado, setItemSelecionado } = useFleet();
  return (
    <>
      <ModalEdit isOpen={isModalOpen} item={itemEditando} setItem={setItemEditando} salvar={salvarEdicao} fechar={() => setIsModalOpen(false)} />
      <ModalDetalhes item={itemSelecionado} fechar={() => setItemSelecionado(null)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <FleetProvider>
        <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] font-sans text-left">
          <Routes>
            <Route path="/" element={<ClienteHomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<CadastroContaPage />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="cadastro/semanal" replace />} />
              <Route path="cadastro/:periodo" element={<AdminCadastroPage />} />
              <Route path="dashboard/:periodo" element={<RedirectDashboardToCadastro />} />
              <Route path="salvos/:periodo" element={<AdminSalvosPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ModaisGlobais />
        </div>
      </FleetProvider>
    </BrowserRouter>
  );
}
