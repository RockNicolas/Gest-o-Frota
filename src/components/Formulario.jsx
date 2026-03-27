import React from 'react';

const OPCOES_TANQUE = [
  { id: 'reserva.png', label: 'Reserva' },
  { id: '1-4.png', label: '1/4' },
  { id: '1-2.png', label: '1/2' },
  { id: '3-4.png', label: '3/4' },
];

const parseNumeroEntrada = (valor, categoria) => {
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
};

const Formulario = ({ form, setForm, adicionar }) => {
  const medidorAtual = parseNumeroEntrada(form.valor, form.categoria);
  const medidorAnterior = parseNumeroEntrada(form.valorAnterior, form.categoria);
  const litrosPrimeiroAbastecimento = parseNumeroEntrada(form.litrosAnterior, form.categoria);
  const deltaUso = medidorAtual - medidorAnterior;
  const totalHorasKm = deltaUso > 0 ? deltaUso.toFixed(2) : '';
  const consumoCalculado =
    deltaUso > 0 && litrosPrimeiroAbastecimento > 0
      ? (litrosPrimeiroAbastecimento / deltaUso).toFixed(2)
      : null;

  const labelTotalUso = form.categoria === 'Máquina' ? 'Total de Horas' : 'Total de KM';

  return (
    <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-200">
      <form onSubmit={adicionar} className="grid grid-cols-1 md:grid-cols-9 gap-4 items-end">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Identificação</label>
          <input required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" placeholder="Prefixo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value.toUpperCase()})}/>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Motorista</label>
          <input required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" placeholder="Nome" value={form.motorista} onChange={e => setForm({...form, motorista: e.target.value.toUpperCase()})}/>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Categoria</label>
          <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold outline-none cursor-pointer" value={form.categoria} 
            onChange={e => {
              const cat = e.target.value;
              const tipoAuto = (cat === 'Máquina' || cat === 'Caminhão') ? 'Diesel' : 'Gasolina';
              setForm({...form, categoria: cat, tipo: tipoAuto});
            }}>
            <option value="Máquina">🚜 Máquina (Diesel)</option>
            <option value="Caminhão">🚛 Caminhão (Diesel)</option>
            <option value="Veículo">🚗 Veículo (Gasolina)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Horímetro/KM anterior</label>
          <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold" value={form.valorAnterior || ''} onChange={e => setForm({...form, valorAnterior: e.target.value})}/>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider text-blue-600">Horímetro/KM atual</label>
          <input type="number" step="any" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-blue-600" value={form.valor || ''} onChange={e => setForm({...form, valor: e.target.value})}/>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">{labelTotalUso}</label>
          <input
            type="text"
            readOnly
            value={totalHorasKm}
            placeholder="Calculado automaticamente"
            className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl outline-none font-bold text-slate-700"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Litros 1º abastecimento</label>
          <input
            type="number"
            step="any"
            required
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-green-600"
            value={form.litrosAnterior || ''}
            onChange={e => setForm({ ...form, litrosAnterior: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Total abastecimento (Lts)</label>
          <input
            type="number"
            step="any"
            required
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-green-600"
            value={form.litros || ''}
            onChange={e => setForm({ ...form, litros: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-red-600 uppercase mb-2 block tracking-wider">Valor Total (R$)</label>
          <input type="number" step="any" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-red-600" placeholder="0,00" value={form.custoTotal || ''} onChange={e => setForm({...form, custoTotal: e.target.value})}/>
        </div>
        <div className="md:col-span-9">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nível do tanque antes do abastecimento</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {OPCOES_TANQUE.map((opcao) => {
              const selecionada = form.tanqueAntesImagem === opcao.id;
              return (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => setForm({ ...form, tanqueAntesImagem: opcao.id })}
                  className={`border rounded-2xl p-2 transition-all min-w-0 ${selecionada ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                >
                  <img src={`/tanque/${opcao.id}`} alt={`Tanque ${opcao.label}`} className="w-full h-20 md:h-24 object-contain" />
                  <p className="text-xs font-black text-slate-700 mt-2">{opcao.label}</p>
                </button>
              );
            })}
          </div>
          {!form.tanqueAntesImagem ? (
            <p className="text-xs font-bold text-red-600 mt-2">Selecione uma imagem do tanque para cadastrar.</p>
          ) : null}
        </div>

        <div className="md:col-span-9">
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Observações</label>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-bold text-slate-700 h-28 resize-none shadow-inner italic"
            placeholder="Anotações do abastecimento, condições do equipamento, rota, etc."
            value={form.observacoes || ''}
            onChange={e => setForm({ ...form, observacoes: e.target.value })}
          />
        </div>

        <button disabled={!form.tanqueAntesImagem} className="w-full md:w-auto bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all uppercase text-[10px] tracking-widest">Lançar</button>
        <div className="md:col-span-9 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs font-bold text-slate-600">
            Cálculo automático: (horímetro/km atual - anterior) e consumo = litros do 1º abastecimento / diferença.
          </p>
          <p className="text-xs font-black text-slate-800 mt-1">
            {labelTotalUso}: {deltaUso > 0 ? deltaUso.toFixed(2) : '0.00'} | Consumo: {consumoCalculado || '--'} {form.categoria === 'Máquina' ? 'L/h' : 'L/km'}
          </p>
        </div>
      </form>
    </div>
  );
};

export default Formulario;