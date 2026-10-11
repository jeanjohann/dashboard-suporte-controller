/**
 * Interface de Ordens de Serviço: apresenta análises, contexto e registros de origem sem modificar a planilha.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import React from 'react';
import { maintenanceInsights, serviceProfile } from '../domain/cardInsights.js';
const currency = (v) =>
  v == null ? '—' : (v / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = (v) =>
  v == null ? '—' : (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
/** Apresenta quantitativos de manutenção por categoria e permite conferir as linhas do grupo. */
export function MaintenanceSummary({ data, selectedClient, onSelect, onDetail }) {
  const m = maintenanceInsights(data);
  if (!m)
    return (
      <p className="scope">Resumo indisponível: faltam as colunas de status, serviço ou cliente.</p>
    );
  const selected = m.groups.find((g) => g.label === selectedClient),
    leader = m.leader;
  return (
    <div className="card-insights">
      <h4>Concentração das manutenções</h4>
      <dl className="cost-summary">
        <div>
          <dt>Clientes identificados com manutenção</dt>
          <dd>{m.clients}</dd>
        </div>
        <div>
          <dt>Participação dos cinco primeiros</dt>
          <dd>{percent(m.topFiveShare)}</dd>
        </div>
        <div>
          <dt>Custo total das manutenções</dt>
          <dd>{currency(m.cost)}</dd>
        </div>
        <div>
          <dt>Custo médio por manutenção válida</dt>
          <dd>{currency(m.average)}</dd>
        </div>
      </dl>
      <p className="scope">
        {m.total} manutenções · {m.costCount} custos válidos.
        {m.unidentified
          ? ` ${m.unidentified} manutenções sem cliente válido continuam no total, mas não na contagem de clientes ou no grupo dos cinco primeiros.`
          : ''}
      </p>
      {leader && (
        <div className="client-highlight">
          <h4>Cliente em destaque</h4>
          <button onClick={() => onSelect(leader.label)}>{leader.label}</button>
          <p>
            {leader.value} manutenções · {percent(leader.value / m.total)} do total · custo{' '}
            {currency(leader.cost)}
          </p>
        </div>
      )}
      <label className="client-picker">
        Resumo por cliente
        <select value={selected?.label || ''} onChange={(e) => onSelect(e.target.value)}>
          <option value="">Selecione um cliente…</option>
          {m.groups.map((g) => (
            <option key={g.label} value={g.label}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
      {selected && (
        <div className="client-highlight">
          <h4>{selected.label}</h4>
          <dl className="cost-summary">
            <div>
              <dt>Manutenções</dt>
              <dd>{selected.value}</dd>
            </div>
            <div>
              <dt>Participação no total</dt>
              <dd>{percent(selected.value / m.total)}</dd>
            </div>
            <div>
              <dt>Custo total</dt>
              <dd>{currency(selected.cost)}</dd>
            </div>
            <div>
              <dt>Custo médio válido</dt>
              <dd>{currency(selected.average)}</dd>
            </div>
          </dl>
          <p className="scope">
            {selected.costRows.length} custos válidos em {selected.value} atendimentos.
          </p>
          <button
            onClick={() =>
              onDetail({ label: 'Manutenções · ' + selected.label, rows: selected.rows, data })
            }
          >
            Conferir atendimentos deste cliente
          </button>
        </div>
      )}
    </div>
  );
}
/** Mostra a composição dos serviços e sua comparação com o período anterior, quando disponível. */
export function ServiceProfileSummary({ data, previous, onDetail }) {
  const profile = serviceProfile(data, previous);
  if (!profile)
    return <p className="scope">Resumo indisponível: faltam Status ou Tipo de Serviço.</p>;
  return (
    <div className="card-insights">
      <h4>Quantidade e custo por tipo</h4>
      <div className="profile-summary-list">
        {profile.items.map((item) => (
          <div key={item.label}>
            <button
              disabled={!item.value}
              onClick={() => onDetail({ label: 'Serviços · ' + item.label, rows: item.rows, data })}
            >
              <span>{item.label}</span>
              <strong>
                {item.value} · {percent(item.share)}
              </strong>
            </button>
            <dl className="cost-summary">
              <div>
                <dt>Custo total lançado</dt>
                <dd>{currency(item.cost)}</dd>
              </div>
              <div>
                <dt>Custo médio válido</dt>
                <dd>{currency(item.average)}</dd>
              </div>
              {item.difference != null && (
                <div>
                  <dt>Quantidade vs. período anterior</dt>
                  <dd>
                    {item.difference > 0 ? '+' : ''}
                    {item.difference} <small>({item.previous} antes)</small>
                  </dd>
                </div>
              )}
            </dl>
            <p>
              {item.costRows.length} custos válidos / {item.value} realizados
            </p>
          </div>
        ))}
      </div>
      <p className="scope">
        Participação sobre {profile.total} realizados. Médias usam os custos válidos de cada tipo,
        incluindo zeros. Clique no tipo para conferir a origem.{' '}
        {previous
          ? 'Comparação com o intervalo anterior de mesma duração.'
          : 'Selecione início e fim para comparar quantidades.'}{' '}
        Tipos mantidos como registrados, inclusive Cancelamento em linhas Concluída/Pago.
      </p>
    </div>
  );
}
