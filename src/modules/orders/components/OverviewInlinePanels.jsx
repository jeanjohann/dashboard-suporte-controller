/** Resumos para apresentação na Visão geral. Reutilizam as regras dos relatórios completos. */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Chart } from '../../../components/Chart.jsx';
import { Section, ExpansionContext, PrintContext } from '../../../components/Section.jsx';
import { groupedCosts } from '../domain/insights.js';
import { fieldLife, lifeGroups, lifeStats } from '../domain/fieldLife.js';
import { supportPerformance } from '../domain/supportPerformance.js';
import { SupportMetricCards } from './SupportMetricCards.jsx';
import { ContractSummary } from './ContractSummary.jsx';
import { MaintenanceSummary, ServiceProfileSummary } from './CardInsights.jsx';
import { RecordDetails } from './RecordDetails.jsx';

const currency = (cents) =>
  cents == null
    ? '—'
    : (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const number = (value) =>
  value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/** Exportações conservam arquivo e filtros, inclusive nos quadros sem um contêiner intermediário. */
function PresentationChart({ title, note, ...props }) {
  const context = useContext(PrintContext);
  return (
    <Chart
      {...props}
      compact
      title={title}
      exportNote={
        'Arquivo: ' +
        (context.filename || '—') +
        ' · Filtros: ' +
        JSON.stringify(context.filters || {}) +
        (note ? ' · ' + note : '')
      }
    />
  );
}

/** Chart compacto delega o título ao contêiner; cada gráfico continua identificado na tela e na impressão. */
function InlineChart({ title, ...props }) {
  return (
    <article className="overview-inline-chart">
      <h3>{title}</h3>
      <PresentationChart {...props} title={title} />
    </article>
  );
}

/** Mantém os quadros comparáveis sem limitar o conteúdo na impressão ou no celular. */
function ComparisonBody({ title, children }) {
  return (
    <div className="overview-comparison-body" role="region" aria-label={title} tabIndex={0}>
      {children}
    </div>
  );
}

/** Cada resumo permanece junto ao seu gráfico, como no painel anterior à reorganização. */
function Operations({ dashboard, metrics }) {
  const [client, setClient] = useState('');
  const [maintenanceDetail, setMaintenanceDetail] = useState(null);
  const [profileDetail, setProfileDetail] = useState(null);
  useEffect(() => {
    setMaintenanceDetail(null);
    setProfileDetail(null);
  }, [dashboard.selected]);
  return (
    <div className="overview-operation-widgets">
      <Section title="Clientes com mais manutenção · Visão geral" help={help.operations}>
        <ComparisonBody title="Clientes com mais manutenção · conteúdo do relatório">
          <PresentationChart
            compact
            title="Assistências técnicas realizadas"
            items={(metrics.clients || []).slice(0, 10)}
            onItemClick={(item) => setClient(item.label)}
          />
          <button
            type="button"
            onClick={() =>
              setMaintenanceDetail({
                label: 'Manutenções realizadas',
                rows: metrics.maintenance.map((row) => row.sourceRow),
              })
            }
          >
            Conferir atendimentos
          </button>
          <MaintenanceSummary
            data={dashboard.selected}
            selectedClient={client}
            onSelect={setClient}
            onDetail={setMaintenanceDetail}
          />
          {maintenanceDetail && (
            <RecordDetails
              data={dashboard.selected}
              rows={maintenanceDetail.rows}
              title={maintenanceDetail.label}
              compact
              onClose={() => setMaintenanceDetail(null)}
            />
          )}
        </ComparisonBody>
      </Section>
      <Section title="Perfil dos serviços realizados · Visão geral" help={help.operations}>
        <ComparisonBody title="Perfil dos serviços realizados · conteúdo do relatório">
          <PresentationChart
            compact
            title="Participação por tipo de serviço"
            items={dashboard.types}
            type="donut"
          />
          <ServiceProfileSummary
            data={dashboard.selected}
            previous={dashboard.previous}
            onDetail={setProfileDetail}
          />
          {profileDetail && (
            <RecordDetails
              data={dashboard.selected}
              rows={profileDetail.rows}
              title={profileDetail.label}
              compact
              onClose={() => setProfileDetail(null)}
            />
          )}
        </ComparisonBody>
      </Section>
    </div>
  );
}

function Costs({ data }) {
  const groups = groupedCosts(data);
  // Agrupar por Status conserva a mesma amostra pareada, mesmo sem a coluna de cliente.
  const components = groupedCosts(data, 'Status');
  const paired = components?.reduce(
    (total, group) => ({
      technician: total.technician + group.composition.technician,
      travel: total.travel + group.composition.travel,
      count: total.count + group.composition.count,
    }),
    { technician: 0, travel: 0, count: 0 },
  );
  const [detail, setDetail] = useState(null);
  useEffect(() => setDetail(null), [data]);
  return (
    <ComparisonBody title="Composição dos custos · conteúdo do relatório">
      <p className="scope">
        Composição: {paired?.count || 0} realizados com Técnico e Km válidos simultaneamente. Km é
        despesa em reais; componentes não substituem o Custo Total lançado.
      </p>
      <PresentationChart
        compact
        title="Componentes de custo"
        format={currency}
        items={
          paired?.count
            ? [
                { label: 'Serviço técnico', value: paired.technician },
                { label: 'Deslocamento', value: paired.travel },
              ]
            : []
        }
      />
      <dl className="cost-summary">
        {[
          ['Técnico + deslocamento', paired?.technician + paired?.travel],
          ['Média técnico + deslocamento', (paired?.technician + paired?.travel) / paired?.count],
          ['Média de serviço técnico', paired?.technician / paired?.count],
          ['Média de deslocamento', paired?.travel / paired?.count],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{currency(paired?.count ? value : null)}</dd>
          </div>
        ))}
      </dl>
      <p className="scope">
        Médias por atendimento na mesma base de {paired?.count || 0} linhas. Valores zero são
        mantidos; campos ausentes não viram zero.
      </p>
      <ContractSummary data={data} onDetail={setDetail} />
      <details className="overview-cost-ranking">
        <summary>Custo total lançado por cliente</summary>
        <InlineChart
          title="Custo total lançado por cliente"
          format={currency}
          items={(groups || [])
            .filter((group) => group.cost.count)
            .map((group) => ({ label: group.label, value: group.cost.sum }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)}
        />
        <p className="scope">Custo Total válido por cliente, incluindo zero; dez maiores grupos.</p>
      </details>
      {detail && (
        <div className="panel">
          <button type="button" onClick={() => setDetail(null)}>
            Fechar conferência contratual da visão geral
          </button>
          <RecordDetails data={data} rows={detail.rows} title={detail.label} />
        </div>
      )}
    </ComparisonBody>
  );
}

function Team({ original, filters }) {
  const execution = useMemo(
    () => supportPerformance(original, filters, 'execution'),
    [original, filters],
  );
  const scheduling = useMemo(
    () => supportPerformance(original, filters, 'scheduling'),
    [original, filters],
  );
  const results = [execution, scheduling].filter((result) => !result.unavailable);
  return (
    <>
      {[execution, scheduling]
        .filter((result) => result.unavailable)
        .map((result) => (
          <p className="notice" key={result.role.column}>
            {result.role.label} indisponível: faltam {result.unavailable.join(', ')}.
          </p>
        ))}
      {!!results.length && <SupportMetricCards results={results} />}
      <div className="dashboard-chart-grid">
        <InlineChart
          compact
          title="Intervenções efetivas por execução"
          items={(execution.groups || []).map((item) => ({
            label: item.label,
            value: item.productive,
          }))}
        />
        <InlineChart
          compact
          title="Intervenções efetivas por agendamento"
          items={(scheduling.groups || []).map((item) => ({
            label: item.label,
            value: item.productive,
          }))}
        />
      </div>
    </>
  );
}

function Equipment({ original, data }) {
  const [category, setCategory] = useState('Rastreador');
  const result = useMemo(() => fieldLife(original, data), [original, data]);
  const periods = result.periods.filter((period) => period.category === category);
  const stats = lifeStats(periods);
  const groups = lifeGroups(periods);
  return result.unavailable ? (
    <p className="notice">
      {result.reason ||
        'Faltam colunas ou datas válidas para reconstruir os ciclos. Consulte a análise completa de Equipamentos.'}
    </p>
  ) : (
    <>
      <label className="overview-inline-category">
        Categoria do equipamento{' '}
        <select
          aria-label="Categoria do equipamento na visão geral"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {['Rastreador', 'Coletora', 'RFID'].map((value) => (
            <option
              key={value}
              disabled={
                value === 'Rastreador' ? !result.trackerAvailable : !result.accessoryAvailable
              }
            >
              {value}
            </option>
          ))}
        </select>
      </label>
      {(category === 'Rastreador' ? !result.trackerAvailable : !result.accessoryAvailable) ? (
        <p className="notice">
          Identificação da categoria indisponível nesta base. Selecione uma categoria disponível.
        </p>
      ) : (
        <>
          <div className="cards overview-inline-metrics">
            {[
              ['Ciclos identificados', number(stats.total)],
              ['Primeiras trocas', number(stats.complete)],
              [
                'Tempo médio acompanhado',
                stats.followup.mean == null ? '—' : number(stats.followup.mean) + ' dias',
              ],
              ['Média até primeira troca', stats.mean == null ? '—' : number(stats.mean) + ' dias'],
            ].map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
          <InlineChart
            compact
            title="Tempo médio até primeira troca por modelo"
            note={
              'Categoria: ' +
              category +
              '; instalação inicial; filtros na instalação; limite: ' +
              (result.reference || '—')
            }
            format={(value) => number(value) + ' dias'}
            items={groups
              .filter((group) => group.mean != null)
              .map((group) => ({ label: group.label, value: group.mean }))}
          />
          <p className="scope">
            Categoria: {category}. Implementação ou instalação explícita da categoria; filtros da
            Visão geral na instalação. Limite do histórico: {result.reference || '—'}. Média até
            troca usa somente {stats.complete} trocas confirmadas. Tempo acompanhado inclui troca,
            cancelamento ou limite, em {stats.followup.count} ciclos com duração válida.{' '}
            {stats.observed} sem troca, {stats.canceled} cancelamentos e {stats.review} em revisão.
            Não é vida útil concluída de toda a frota.
          </p>
        </>
      )}
    </>
  );
}

function Park({ source }) {
  const rows = source?.data?.rows;
  const group = (key) => {
    const counts = new Map();
    for (const row of rows || []) {
      const label = row[key] || 'Não informado';
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    return [...counts]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };
  return rows ? (
    <>
      <p className="scope">
        {source.filename} · {rows.length} registros do arquivo operacional completo, incluindo todas
        as situações. Os filtros e o período das OS não se aplicam. Não representa parque ativo
        histórico.
      </p>
      <div className="executive-cards overview-park-metrics">
        {[
          ['Registros operacionais', rows.length],
          ['Clientes identificados', new Set(rows.map((row) => row.client).filter(Boolean)).size],
          ['Registros sem serial', rows.filter((row) => !row.serial).length],
        ].map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{number(value)}</strong>
          </article>
        ))}
      </div>
      <div className="dashboard-chart-grid">
        <InlineChart compact title="Parque por situação" items={group('status')} type="donut" />
        <InlineChart
          compact
          title="Clientes com mais equipamentos registrados"
          items={group('client').slice(0, 10)}
        />
      </div>
    </>
  ) : (
    <p className="notice">Importe a planilha operacional para apresentar a composição do parque.</p>
  );
}

const help = {
  operations:
    'Filtros da Visão geral. Clientes com mais manutenção conta Assistências Técnicas Concluída/Pago, sem Visita Improdutiva; apresenta dez maiores grupos. Perfil conta todos os realizados e separa visitas improdutivas. Volume não mede taxa de falha. Os detalhes abaixo conservam custos válidos e linhas de origem.',
  clients:
    'Filtros da Visão geral. Custo por cliente soma Custo Total válido nos realizados, incluindo visitas improdutivas, e mostra dez maiores grupos. Composição usa Técnico e Km válidos simultaneamente. Valores de contrato usam Valor a cobrar e Cobrança, com base própria. Ausência não vira zero; nenhum total comprova recebimento ou lucro.',
  support:
    'Filtros da Visão geral. Usa as mesmas regras da Equipe de suporte: execução pela Data de atendimento e agendamento pela data Agendamento, somente Concluída/Pago. Intervenções efetivas excluem visitas improdutivas. Papéis têm bases próprias e não devem ser somados; volume não mede qualidade ou produtividade por hora.',
  equipment:
    'Mesmas regras da vida em campo: implementação ou instalação explícita da categoria e primeira troca confirmada. A seleção da Visão geral é aplicada ao início; vínculos usam o arquivo completo. A média até troca inclui somente trocas com duração válida; tempo acompanhado também inclui ciclos sem troca e cancelamentos. Manutenção sem troca não reinicia o ciclo. Revisão fica fora das durações. Não presume atividade nem vida útil final dos ciclos abertos.',
  park: 'Fotografia do arquivo operacional completo, em todas as situações, inclusive cancelados. Uma linha é um registro operacional. Não aplica filtros nem período de OS, não reconstrói parque ativo histórico e não atribui custos ou titularidade histórica. A conferência de vínculos continua na análise completa.',
};

/** Títulos exclusivos evitam modificar o grupo ou a preferência do relatório completo em outra categoria. */
export function OverviewInlinePanel({
  topic,
  label,
  open,
  revision,
  original,
  dashboard,
  metrics,
  filters,
  operational,
}) {
  const printContext = useContext(PrintContext);
  const expansion = useMemo(() => ({ open, mode: 'complete', revision }), [open, revision]);
  const content = (
    <ExpansionContext.Provider value={expansion}>
      {topic === 'operations' ? (
        <Operations dashboard={dashboard} metrics={metrics} />
      ) : (
        <Section
          title={`${topic === 'clients' ? 'Composição dos custos' : label} · Visão geral`}
          help={help[topic]}
        >
          {topic === 'clients' && <Costs key={JSON.stringify(filters)} data={dashboard.selected} />}
          {topic === 'support' && <Team original={original} filters={filters} />}
          {topic === 'equipment' && <Equipment original={original} data={dashboard.selected} />}
          {topic === 'park' && <Park source={operational} />}
        </Section>
      )}
    </ExpansionContext.Provider>
  );
  return topic === 'park' ? (
    <PrintContext.Provider
      value={{
        filename: operational?.filename,
        filters: {
          alcance: 'OS → Visão geral · Parque e Manutenção',
          base: 'Arquivo operacional completo; filtros de OS não aplicados',
        },
      }}
    >
      {content}
    </PrintContext.Provider>
  ) : (
    <PrintContext.Provider
      value={{
        ...printContext,
        referenceDate:
          topic === 'equipment'
            ? 'Limite do histórico informado na seção'
            : printContext.referenceDate,
      }}
    >
      {content}
    </PrintContext.Provider>
  );
}
