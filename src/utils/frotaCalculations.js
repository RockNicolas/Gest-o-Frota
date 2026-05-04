export function readRoleFromToken(token) {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(atob(padded));
    return json.role || 'admin';
  } catch {
    return null;
  }
}

export function parseNumeroEntrada(valor, categoria) {
  const texto = String(valor ?? '').trim();
  if (!texto) return 0;

  const isKm = categoria === 'Caminhão' || categoria === 'Veículo';
  if (isKm) {
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(texto)) {
      return Number(texto.replace(/\./g, '').replace(',', '.'));
    }
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(texto)) {
      return Number(texto.replace(/,/g, ''));
    }
  }

  return Number(texto.replace(',', '.'));
}

export function extrairLitrosCalculoMeta(observacoes) {
  const texto = String(observacoes || '');
  const match = texto.match(/\[\[LITROS_CALC:([0-9.,]+)\]\]/);
  if (!match) return null;
  const valor = Number(String(match[1]).replace(',', '.'));
  return Number.isFinite(valor) ? valor : null;
}

export function calcularMediaCategoria(registros, categoria, titulo, periodoAtual) {
  const itens = registros.filter((registro) => registro.categoria === categoria);
  const isMaquina = categoria === 'Máquina';

  const { somaConsumo, quantidadeConsumos } = itens.reduce(
    (acc, item) => {
      const uso = Number(item.valor || 0);
      const litrosMeta = extrairLitrosCalculoMeta(item.observacoes);
      const litrosBase =
        periodoAtual === 'mensal'
          ? Number(item.litros || 0)
          : (litrosMeta ?? Number(item.litros || 0));

      if (uso > 0 && litrosBase > 0) {
        const consumo = isMaquina ? litrosBase / uso : uso / litrosBase;
        return {
          somaConsumo: acc.somaConsumo + consumo,
          quantidadeConsumos: acc.quantidadeConsumos + 1,
        };
      }

      return acc;
    },
    { somaConsumo: 0, quantidadeConsumos: 0 }
  );

  const media = quantidadeConsumos > 0 ? somaConsumo / quantidadeConsumos : 0;

  return {
    categoria,
    titulo,
    quantidade: itens.length,
    media,
    totalUso: itens.reduce((acc, item) => acc + Math.max(Number(item.valor || 0), 0), 0),
    unidadeUso: isMaquina ? 'h' : 'km',
    unidadeMedia: isMaquina ? 'L/h' : 'km/L',
  };
}

export function extrairTanqueImagemMeta(observacoes) {
  const texto = String(observacoes || '');
  const match = texto.match(/\[\[TANQUE_IMG:([^\]]+)\]\]/);
  return match ? String(match[1]) : '';
}

export function removerLitrosCalculoMeta(observacoes) {
  return String(observacoes || '')
    .replace(/\[\[LITROS_CALC:[0-9.,]+\]\]\s*/g, '')
    .replace(/\[\[TANQUE_IMG:[^\]]+\]\]\s*/g, '')
    .trim();
}

export function montarObservacoesComMeta(observacoes, litrosCalculo, tanqueImagem) {
  const limpo = removerLitrosCalculoMeta(observacoes);
  const litrosNum = Number(litrosCalculo);
  const metas = [];

  if (litrosNum > 0) {
    metas.push(`[[LITROS_CALC:${litrosNum}]]`);
  }
  if (tanqueImagem) {
    metas.push(`[[TANQUE_IMG:${tanqueImagem}]]`);
  }

  const prefixo = metas.join('\n');
  if (!prefixo) return limpo;
  return limpo ? `${prefixo}\n${limpo}` : prefixo;
}

export function normalizarPeriodoUrl(periodo) {
  return periodo === 'mensal' ? 'mensal' : 'semanal';
}
