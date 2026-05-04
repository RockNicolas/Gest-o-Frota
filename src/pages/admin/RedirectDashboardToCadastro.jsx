import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { normalizarPeriodoUrl } from '../../utils/frotaCalculations';

/** Links antigos /admin/dashboard/:periodo passam a ir para a página de cadastro + dashboard embutido. */
export default function RedirectDashboardToCadastro() {
  const { periodo } = useParams();
  const p = normalizarPeriodoUrl(periodo);
  return <Navigate to={`/admin/cadastro/${p}`} replace />;
}
