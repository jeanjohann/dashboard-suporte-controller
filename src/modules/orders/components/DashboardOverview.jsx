/**
 * Interface de Ordens de Serviço: apresenta análises, contexto e registros de origem sem modificar a planilha.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { InfoNote } from '../../../components/InfoNote.jsx';
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { dashboardData } from '../domain/dashboard.js';
import { OverviewKpis } from './OverviewKpis.jsx';
import { managementMetrics } from '../domain/management.js';
import { applyFilters, field } from '../../../shared/data/filters.js';
import { money } from '../domain/analysis.js';
import { Chart } from '../../../components/Chart.jsx';
import { MaintenanceSummary, ServiceProfileSummary } from './CardInsights.jsx';
import { ContractSummary } from './ContractSummary.jsx';
import { RecordDetails } from './RecordDetails.jsx';
import { chartColors } from '../../../shared/charts/palette.js';
const currency = (v) =>
  v == null ? '—' : (v / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (v) => v?.split('-').reverse().join('/');
function MultiChart({ items, series }) {
  return items.length ? (
    <div className="dashboard-plot">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} margin={{ left: 0, right: 12, bottom: 16 }}>
          <CartesianGrid vertical={false} stroke="#edf1f4" />
          <XAxis dataKey="label" tickMargin={10} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} width={42} axisLine={false} tickLine={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
          {series.map((s) => (
            <Bar
              isAnimationActive={false}
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              stackId={s.stack}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <p className="scope">Sem dados para esta seleção.</p>
  );
}
/** Reúne indicadores de gestão e comparação temporal sobre os filtros de OS selecionados. */
export function DashboardOverview({ original, filters, operational, onPage }) {
  const d = dashboardData(original, filters),
    scheduling = applyFilters(original, filters, 'Agendamento'),
    m = managementMetrics(d.selected, scheduling),
    [detail, setDetail] = React.useState(null),
    [selectedClient, setSelectedClient] = React.useState('');
  const names = [...new Set([...(m.execution || []), ...(m.scheduling || [])].map((x) => x.label))],
    team = names.map((label) => ({
      label,
      execution: m.execution?.find((x) => x.label === label)?.value || 0,
      scheduling: m.scheduling?.find((x) => x.label === label)?.value || 0,
    }));
  const pairs = m.completed
    .map((row) => ({
      technical: money(field(original, row, 'Técnico')),
      travel: money(field(original, row, 'Km')),
    }))
    .filter((pair) => pair.technical != null && pair.travel != null);
  const composition = pairs.length
    ? [
        { label: 'Serviço técnico', value: pairs.reduce((sum, p) => sum + p.technical, 0) },
        { label: 'Deslocamento', value: pairs.reduce((sum, p) => sum + p.travel, 0) },
      ]
    : [];
  const op = operational?.data,
    groups = (key) => {
      const map = new Map();
      for (const r of op?.rows || []) {
        const label = r[key] || 'Não informado';
        map.set(label, (map.get(label) || 0) + 1);
      }
      return [...map].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    };
  return (
    <section className="executive-dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">VISÃO GERAL DO SUPORTE</span>
          <h2>Operação, pessoas e equipamentos</h2>
        </div>
        <span className="dashboard-period">
          {filters.start && filters.end
            ? date(filters.start) + ' → ' + date(filters.end)
            : 'Histórico selecionado'}
        </span>
      </div>
      <OverviewKpis current={d.current} past={d.past} />
      <p className="scope">
        {d.range
          ? `Comparação: ${date(d.range.start)} a ${date(d.range.end)} · ${d.range.days} dias em cada período · mesmos filtros de categoria. Histórico disponível não comprova cobertura completa dos períodos.`
          : 'A comparação exige um intervalo válido com início e fim.'}{' '}
        Custos: {d.current.costCount} valores válidos; valores ausentes não viram zero.
      </p>
      <div className="agenda-strip">
        <button
          onClick={() =>
            setDetail({ label: 'Aguardando agendamento', rows: d.agenda.waiting, data: original })
          }
        >
          <span>Aguardando agendamento</span>
          <strong>{d.agenda.waiting.length}</strong>
        </button>
        <button
          onClick={() =>
            setDetail({ label: 'Agendados', rows: d.agenda.scheduled, data: original })
          }
        >
          <span>Agendados</span>
          <strong>{d.agenda.scheduled.length}</strong>
        </button>
        <p>
          Situação registrada no arquivo importado · filtros de categoria aplicados · sem filtro de
          datas, pois a agenda pode não ter Data de atendimento.
        </p>
      </div>
      <div className="dashboard-chart-grid">
        <article className="panel dashboard-widget">
          <div className="inline-help-heading">
            <h3>Movimento dos atendimentos</h3>
            <InfoNote>
              Conta as linhas Concluída ou Pago por mês da Data de atendimento. Separa
              Implementação, Assistência Técnica e demais tipos. Registros sem data válida ficam
              fora do gráfico mensal. Use para observar a evolução do volume e do perfil de
              serviços, sem tratar vários serviços de um chamado como um único atendimento.
            </InfoNote>
          </div>
          <MultiChart
            items={d.months}
            series={[
              {
                key: 'implementation',
                label: 'Implementações',
                color: chartColors.blue,
                stack: 'volume',
              },
              {
                key: 'unproductive',
                label: 'Visitas improdutivas',
                color: chartColors.amber,
                stack: 'volume',
              },
              {
                key: 'maintenance',
                label: 'Assistências técnicas',
                color: chartColors.teal,
                stack: 'volume',
              },
              { key: 'other', label: 'Outros tipos', color: chartColors.other, stack: 'volume' },
            ]}
          />
        </article>
        <article className="panel dashboard-widget">
          <div className="inline-help-heading">
            <h3>Atuação da equipe de suporte</h3>
            <InfoNote>
              Concluída/Pago · agendamentos pela data prevista, execuções pela data do atendimento.
              São papéis distintos e não devem ser somados como total de serviços.
            </InfoNote>
          </div>
          {m.execution && m.scheduling ? (
            <MultiChart
              items={team}
              series={[
                { key: 'scheduling', label: 'Agendamentos', color: chartColors.blue },
                { key: 'execution', label: 'Execuções', color: chartColors.teal },
              ]}
            />
          ) : (
            <p>As duas colunas de responsáveis são necessárias.</p>
          )}
          <div className="overview-links">
            {(m.execution || []).map((item) => (
              <button
                key={'e' + item.label}
                onClick={() =>
                  setDetail({ ...item, label: 'Execuções · ' + item.label, data: d.selected })
                }
              >
                Execuções · {item.label}: {item.value}
              </button>
            ))}
            {(m.scheduling || []).map((item) => (
              <button
                key={'s' + item.label}
                onClick={() =>
                  setDetail({ ...item, label: 'Agendamentos · ' + item.label, data: scheduling })
                }
              >
                Agendamentos · {item.label}: {item.value}
              </button>
            ))}
          </div>
        </article>
      </div>
      <div className="dashboard-lower-grid">
        <article className="panel dashboard-widget">
          <div className="inline-help-heading">
            <h3>Clientes com mais manutenção</h3>
            <InfoNote label="Regras de Clientes com mais manutenção">
              Conta Assistências Técnicas Concluída/Pago sem Motivo Visita Improdutiva por razão
              social, seguindo os filtros de OS. O gráfico apresenta os dez maiores grupos; o
              detalhe permite conferir as linhas. Volume alto pode refletir tamanho da frota e não
              mede taxa de falha. O resumo mostra custos válidos e participação na base de
              manutenções selecionadas.
            </InfoNote>
          </div>
          <Chart
            compact
            title="Assistências técnicas realizadas"
            items={(m.clients || []).slice(0, 10)}
            onItemClick={(item) => setSelectedClient(item.label)}
          />
          <button
            onClick={() =>
              setDetail({
                label: 'Manutenções realizadas',
                rows: m.maintenance.map((r) => r.sourceRow),
                data: d.selected,
              })
            }
          >
            Conferir atendimentos
          </button>
          <MaintenanceSummary
            data={d.selected}
            selectedClient={selectedClient}
            onSelect={setSelectedClient}
            onDetail={setDetail}
          />
        </article>
        <article className="panel dashboard-widget">
          <div className="inline-help-heading">
            <h3>Perfil dos serviços realizados</h3>
            <InfoNote label="Regras de Perfil dos serviços realizados">
              Conta linhas Concluída/Pago por Tipo de Serviço e separa Motivo Visita Improdutiva em
              grupo próprio. Participação = quantidade do grupo / total de visitas e atendimentos
              registrados na seleção. Custos e médias usam Custo Total válido do grupo, incluindo
              zero. A comparação anterior usa intervalo de mesma duração e mesmos filtros de
              categoria; não comprova cobertura completa do histórico.
            </InfoNote>
          </div>
          <Chart compact title="Participação por tipo de serviço" type="donut" items={d.types} />
          <ServiceProfileSummary data={d.selected} previous={d.previous} onDetail={setDetail} />
        </article>
        <article className="panel dashboard-widget">
          <div className="inline-help-heading">
            <h3>Composição dos custos</h3>
            <InfoNote label="Regras de Composição dos custos">
              Usa somente linhas Concluída/Pago com Técnico e Km válidos simultaneamente, incluindo
              visitas improdutivas. Soma cada componente na mesma amostra e divide pela quantidade
              dessas linhas para calcular as médias. Km é despesa em reais. Esta soma analítica não
              substitui Custo Total lançado; campos ausentes não são zero. Use para observar a
              participação do serviço técnico e do deslocamento, considerando a seleção atual.
            </InfoNote>
          </div>
          <p className="scope">
            {pairs.length} atendimentos com serviço técnico e deslocamento válidos. Mesma base para
            ambos os componentes; não substitui o Custo Total lançado.
          </p>
          <Chart compact title="Componentes de custo" items={composition} format={currency} />
          <dl className="cost-summary">
            <div>
              <dt>Técnico + deslocamento</dt>
              <dd>
                {pairs.length
                  ? currency(composition.reduce((sum, item) => sum + item.value, 0))
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Média técnico + deslocamento</dt>
              <dd>
                {pairs.length
                  ? currency(composition.reduce((sum, item) => sum + item.value, 0) / pairs.length)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Média de serviço técnico</dt>
              <dd>{pairs.length ? currency(composition[0].value / pairs.length) : '—'}</dd>
            </div>
            <div>
              <dt>Média de deslocamento</dt>
              <dd>{pairs.length ? currency(composition[1].value / pairs.length) : '—'}</dd>
            </div>
          </dl>
          <p className="scope">
            Médias por atendimento, na mesma base de {pairs.length} linhas com ambos os componentes
            válidos. Valores zero são mantidos.
          </p>
          <ContractSummary data={d.selected} onDetail={setDetail} />
        </article>
      </div>
      <div className="operational-overview">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">BASE OPERACIONAL</span>
            <h2>Parque registrado</h2>
          </div>
          <button onClick={() => onPage('operational')}>
            {op ? 'Revisar operacional' : 'Importar operacional'}
          </button>
        </div>
        {op ? (
          <>
            <p className="scope">
              {operational.filename} · fotografia do arquivo completo, incluindo todas as situações.
              Filtros e período das OS não se aplicam a este bloco; não representa parque ativo
              histórico.
            </p>
            <div className="executive-cards">
              <article>
                <span>Registros operacionais</span>
                <strong>{op.rows.length}</strong>
              </article>
              <article>
                <span>Clientes identificados</span>
                <strong>{new Set(op.rows.map((r) => r.client).filter(Boolean)).size}</strong>
              </article>
              <article>
                <span>Registros sem serial</span>
                <strong>{op.rows.filter((r) => !r.serial).length}</strong>
              </article>
            </div>
            <div className="dashboard-chart-grid">
              <article className="panel dashboard-widget">
                <div className="inline-help-heading">
                  <h3>Parque por situação</h3>
                  <InfoNote label="Regras de Parque por situação">
                    Conta todos os registros do arquivo operacional completo por situação, inclusive
                    cancelados. Campos ausentes ficam em grupo próprio. Não segue período nem
                    filtros da OS e não reconstrói parque ativo histórico. Serve para visualizar a
                    composição da referência importada.
                  </InfoNote>
                </div>
                <Chart
                  compact
                  title="Registros por situação"
                  type="donut"
                  items={groups('status')}
                />
              </article>
              <article className="panel dashboard-widget">
                <div className="inline-help-heading">
                  <h3>Clientes com mais equipamentos registrados</h3>
                  <InfoNote label="Regras de Clientes com mais equipamentos registrados">
                    Conta linhas do arquivo operacional completo por cliente e apresenta os dez
                    maiores grupos. Todas as situações entram, incluindo cancelados; cliente ausente
                    fica como Não informado. Não aplica período nem filtros da OS, não soma
                    mensalidades e não presume equipamentos atualmente ativos.
                  </InfoNote>
                </div>
                <Chart
                  compact
                  title="10 maiores grupos por cliente"
                  items={groups('client').slice(0, 10)}
                />
              </article>
            </div>
          </>
        ) : (
          <p className="notice">
            Importe a planilha na página Operacional. Os dados aparecerão aqui ao retornar.
          </p>
        )}
      </div>
      {detail && (
        <div className="panel">
          <button onClick={() => setDetail(null)}>Fechar conferência</button>
          <RecordDetails data={detail.data} rows={detail.rows} title={detail.label} />
        </div>
      )}
    </section>
  );
}
