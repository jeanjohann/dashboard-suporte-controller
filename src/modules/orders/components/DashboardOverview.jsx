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
import { applyFilters } from '../../../shared/data/filters.js';
import { RecordDetails } from './RecordDetails.jsx';
import { useAccess } from '../../../shared/security/Access.jsx';
import { allowsPage } from '../../../shared/security/permissions.js';
import { chartColors } from '../../../shared/charts/palette.js';
import { OverviewInlinePanel } from './OverviewInlinePanels.jsx';
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
export function DashboardOverview({ original, filters, operational, onPage, onCategory }) {
  const { user } = useAccess();
  const [presentations, setPresentations] = React.useState({});
  const [presentationRevision, setPresentationRevision] = React.useState(0);
  const [previewToReveal, setPreviewToReveal] = React.useState(null);
  const presentationId = React.useId();
  React.useEffect(() => {
    if (previewToReveal)
      document.getElementById(presentationId + '-' + previewToReveal)?.scrollIntoView({
        block: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
  }, [previewToReveal, presentationId]);
  const topics = [
    [
      'operations',
      'Operação',
      'Entenda o volume, as visitas improdutivas, os retornos e a distribuição regional.',
    ],
    [
      'clients',
      'Clientes e custos',
      'Compare custos de execução, componentes e responsabilidades contratuais.',
    ],
    [
      'support',
      'Equipe de suporte',
      'Acompanhe responsáveis por execução e agendamento, com suas próprias datas.',
    ],
    ['equipment', 'Equipamentos', 'Investigue ciclos, trocas e períodos ainda em observação.'],
    ...(allowsPage(user, 'operational-analysis')
      ? [
          [
            'park',
            'Parque e Manutenção',
            'Consulte a fotografia operacional, a cobertura do histórico e os vínculos com OS.',
          ],
        ]
      : []),
  ];
  const d = dashboardData(original, filters),
    scheduling = applyFilters(original, filters, 'Agendamento'),
    m = managementMetrics(d.selected, scheduling),
    [detail, setDetail] = React.useState(null);
  const agendaId = React.useId(),
    agendaDetailRef = React.useRef(null),
    agendaButtons = React.useRef({});
  // Conferências antigas não devem continuar exibindo outra base após alterar o recorte.
  React.useEffect(() => setDetail(null), [original, filters]);
  React.useEffect(() => {
    if (detail?.agenda)
      agendaDetailRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
  }, [detail?.agenda]);
  const agendaLabels = { waiting: 'Aguardando agendamento', scheduled: 'Agendados' };
  const closeAgenda = () => {
    agendaButtons.current[detail?.agenda]?.focus();
    setDetail(null);
  };
  const names = [...new Set([...(m.execution || []), ...(m.scheduling || [])].map((x) => x.label))],
    team = names.map((label) => ({
      label,
      execution: m.execution?.find((x) => x.label === label)?.value || 0,
      scheduling: m.scheduling?.find((x) => x.label === label)?.value || 0,
    }));
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
        {Object.entries(agendaLabels).map(([key, label]) => (
          <button
            key={key}
            type="button"
            ref={(element) => {
              agendaButtons.current[key] = element;
            }}
            aria-expanded={detail?.agenda === key}
            aria-controls={detail?.agenda === key ? agendaId : undefined}
            onClick={() =>
              setDetail((previous) => (previous?.agenda === key ? null : { agenda: key }))
            }
          >
            <span>{label}</span>
            <strong>{d.agenda[key].length}</strong>
          </button>
        ))}
        <p>
          Situação registrada no arquivo importado · filtros de categoria aplicados · sem filtro de
          datas, pois a agenda pode não ter Data de atendimento.
        </p>
      </div>
      {detail?.agenda && (
        <div id={agendaId} ref={agendaDetailRef} className="overview-agenda-detail">
          <RecordDetails
            key={detail.agenda}
            data={original}
            rows={d.agenda[detail.agenda]}
            title={agendaLabels[detail.agenda]}
            compact
            onClose={closeAgenda}
          />
        </div>
      )}
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
      <div className="overview-presentation-toolbar" aria-label="Gráficos para apresentação">
        <strong>Apresentar nesta tela</strong>
        <div>
          <button
            type="button"
            onClick={() => {
              setPreviewToReveal(null);
              setPresentations(Object.fromEntries(topics.map(([key]) => [key, true])));
              setPresentationRevision((previous) => previous + 1);
            }}
          >
            Mostrar todos os gráficos
          </button>
          <button
            type="button"
            disabled={!topics.some(([key]) => presentations[key])}
            onClick={() => {
              setPreviewToReveal(null);
              setPresentations((previous) =>
                Object.fromEntries(Object.keys(previous).map((key) => [key, false])),
              );
            }}
          >
            Recolher gráficos da apresentação
          </button>
        </div>
      </div>
      <nav className="analysis-destinations" aria-label="Aprofundar a análise de OS">
        {topics.map(([key, label, description]) => (
          <article key={key} className={presentations[key] ? 'is-presenting' : ''}>
            <strong>{label}</strong>
            <span>{description}</span>
            <div className="overview-destination-actions">
              <button
                type="button"
                aria-expanded={!!presentations[key]}
                aria-controls={presentationId + '-' + key}
                aria-label={
                  (presentations[key] ? 'Recolher' : 'Mostrar') + ' gráficos de ' + label + ' aqui'
                }
                onClick={() => {
                  setPreviewToReveal(presentations[key] ? null : key);
                  setPresentations((previous) => ({ ...previous, [key]: !previous[key] }));
                }}
              >
                {presentations[key] ? 'Recolher gráficos' : 'Mostrar gráficos aqui'}
              </button>
              <button
                type="button"
                className="overview-destination-link"
                aria-label={'Abrir análise completa de ' + label}
                onClick={() => (key === 'park' ? onPage('operational-analysis') : onCategory(key))}
              >
                {key === 'park' ? 'Abrir módulo →' : 'Abrir análise →'}
              </button>
            </div>
          </article>
        ))}
      </nav>
      <p className="scope">
        Gráficos nesta tela usam os filtros da Visão geral; o parque usa o arquivo operacional
        completo. Abrir análise leva ao destino com seus filtros próprios.
      </p>
      <div className="overview-presentation-grid">
        {topics.map(([key, label]) => (
          <div
            key={key}
            id={presentationId + '-' + key}
            hidden={!presentations[key]}
            className={`overview-inline-panel overview-inline-panel--${key}`}
          >
            {Object.hasOwn(presentations, key) && (
              <OverviewInlinePanel
                topic={key}
                label={label}
                open={!!presentations[key]}
                revision={presentationRevision}
                original={original}
                dashboard={d}
                metrics={m}
                filters={filters}
                operational={operational}
              />
            )}
          </div>
        ))}
      </div>
      {detail && !detail.agenda && (
        <div className="panel">
          <button onClick={() => setDetail(null)}>Fechar conferência</button>
          <RecordDetails data={detail.data} rows={detail.rows} title={detail.label} />
        </div>
      )}
    </section>
  );
}
