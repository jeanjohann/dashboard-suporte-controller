/** Relatórios mensais, financeiros, operacionais e detalhamento de chamados de OS. */
import React, { useEffect, useState } from 'react';
import { Section } from '../../../components/Section.jsx';
import { sectionLabels } from '../config/preferences.js';
import { BarChart } from '../../../components/BarChart.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { MonthlyBreakdown } from './RecordDetails.jsx';
import { RecordDetails } from './RecordDetails.jsx';
import { ContractSummary } from './ContractSummary.jsx';
const currency = (cents) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Mantém a contagem mensal e a consulta das linhas que compõem cada mês. */
export function OrdersMonthlyPanel({ monthly, selected, category, visible }) {
  return (
    <Section title={sectionLabels.monthly} visible={visible}>
      {monthly ? (
        <BarChart
          title="Visitas e atendimentos registrados por mês"
          description={`Data de atendimento · somente Concluída e Pago · ${monthly.missingDates} realizados excluídos deste gráfico por data ausente ou inválida. Meses sem registros não são exibidos.`}
          items={monthly.items}
        />
      ) : (
        <div className="notice">Gráfico indisponível: faltam Status ou Data de atendimento.</div>
      )}
      {category !== 'overview' && <MonthlyBreakdown data={selected} />}
    </Section>
  );
}

/** Recebe totais em centavos; valor lançado, exclusões e divergências vêm do domínio. */
export function OrdersFinancePanel({ financial, data, visible }) {
  const [detail, setDetail] = useState(null);
  useEffect(() => setDetail(null), [data]);
  return (
    <Section title={sectionLabels.finance} visible={visible}>
      {financial ? (
        <>
          <section className="cards financial-cards" style={{ marginBottom: 18 }}>
            {[
              ['cost', 'Custo total realizado'],
              ['client', 'Valor contratual · Cliente'],
              ['absorbed', 'Valor contratual · Addlog'],
              ['travel', 'Deslocamento realizado'],
            ].map(([key, label]) => (
              <article key={key}>
                <span>{label}</span>
                <strong style={{ fontSize: 22 }}>{currency(financial.totals[key])}</strong>
              </article>
            ))}
          </section>
          <p className="scope">
            Somente Concluída e Pago ({financial.eligible} linhas). Cancelada e demais status não
            entram. Custo técnico: {currency(financial.totals.technician)}. Valores contratuais não
            representam recebimentos. Células excluídas por ausência/incompatibilidade: custo total{' '}
            {financial.excluded.cost}, deslocamento {financial.excluded.travel}, técnico{' '}
            {financial.excluded.technician}; linhas excluídas dos valores contratuais{' '}
            {financial.excluded.contractual}. {financial.issues.length} divergências de custo; total
            lançado mantido.
          </p>
        </>
      ) : (
        <div className="notice">
          Indicadores financeiros indisponíveis: faltam cabeçalhos necessários.
        </div>
      )}
      <ContractSummary data={data} onDetail={setDetail} />
      {detail && (
        <div className="panel">
          <button type="button" onClick={() => setDetail(null)}>
            Fechar conferência contratual
          </button>
          <RecordDetails data={detail.data} rows={detail.rows} title={detail.label} />
        </div>
      )}
    </Section>
  );
}

/** Contagens por status independem da busca textual da tabela original. */
export function OrdersOperationsPanel({ summary, visible }) {
  return (
    <>
      <Section title={sectionLabels.operations} visible={visible}>
        {summary ? (
          <section className="cards" style={{ marginBottom: 18 }}>
            {[
              [summary.completed, 'Atendimentos realizados'],
              [summary.canceled, 'Atendimentos cancelados'],
              [summary.canceledCalls, 'Chamados com cancelamento'],
              [summary.other, 'Demais status'],
            ].map(([value, label]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value.toLocaleString('pt-BR')}</strong>
              </article>
            ))}
          </section>
        ) : (
          <div className="notice">
            Indicadores operacionais indisponíveis: cabeçalho Status não encontrado.
          </div>
        )}
        <p className="scope">
          Contagens sobre a seleção dos filtros, independentemente da busca textual. Realizados:
          Concluída ou Pago. Chamados com cancelamento: ao menos uma linha Cancelada na seleção.
          Demais status inclui pendências e valores não reconhecidos.
        </p>
      </Section>
    </>
  );
}

/** Um chamado reúne as linhas de serviço presentes na seleção dos filtros. */
export function OrdersCallsPanel({ summary, visible }) {
  return (
    <Section title={sectionLabels.calls} visible={visible}>
      {summary && (
        <details className="panel" style={{ marginBottom: 18 }}>
          <summary style={{ padding: 18, cursor: 'pointer' }}>
            Detalhamento dos {summary.calls.length} chamados
          </summary>
          <div className="table-scroll">
            <SortableTable>
              <thead>
                <tr>
                  <th>Chamado</th>
                  <th>Linhas</th>
                  <th>Realizados</th>
                  <th>Cancelados</th>
                  <th>Demais status</th>
                </tr>
              </thead>
              <tbody>
                {summary.calls.map((call) => (
                  <tr key={call.os}>
                    <td>{call.os}</td>
                    <td>{call.total}</td>
                    <td>{call.completed}</td>
                    <td>{call.canceled}</td>
                    <td>{call.other}</td>
                  </tr>
                ))}
              </tbody>
            </SortableTable>
          </div>
        </details>
      )}
    </Section>
  );
}
