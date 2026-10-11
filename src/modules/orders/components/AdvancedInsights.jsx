/**
 * Interface de Ordens de Serviço: apresenta análises, contexto e registros de origem sem modificar a planilha.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import React, { useState } from 'react';
import {
  groupedCosts,
  callInsights,
  recurringVisits,
  interventionProfiles,
  durationInsights,
  monthlyCosts,
} from '../domain/insights.js';
import { Section } from '../../../components/Section.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { RecordDetails } from './RecordDetails.jsx';
import { csv, download } from '../../../shared/export/exports.js';
const number = (value) =>
  value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const currency = (value) =>
  value == null
    ? '—'
    : (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const metric = (value) => (value?.count ? value.sum : null);
const day = (value) => value?.split('-').reverse().join('/') || '—';
const financialFields = [
  ['cost', 'Custo total lançado'],
  ['technician', 'Serviço técnico'],
  ['travel', 'Deslocamento'],
  ['client', 'Contratual Cliente'],
  ['absorbed', 'Contratual Addlog'],
  ['addlogCost', 'Custo total em cobranças Addlog'],
];
function InsightTable({ title, headers, items, values, data, filename, filters }) {
  const [detail, setDetail] = useState(null);
  return (
    <div className="insight-table">
      <PermissionButton
        action="export"
        className="report-download"
        onClick={() =>
          download(
            csv([
              ['Análise', title],
              ['Arquivo', filename],
              ['Filtros', JSON.stringify(filters)],
              ['Regra', 'Somente realizados; valores contratuais não são recebimentos'],
              [],
              ...[
                headers.concat('Linhas Excel'),
                ...items.map((item) => values(item).concat((item.rows || []).join(', '))),
              ],
            ]),
            'text/csv;charset=utf-8',
            'analise-' +
              title
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/gi, '-')
                .toLowerCase() +
              '.csv',
          )
        }
      >
        Baixar tabela CSV
      </PermissionButton>
      <div className="table-scroll">
        <SortableTable>
          <thead>
            <tr>
              {headers.map((label) => (
                <th key={label}>{label}</th>
              ))}
              <th>Origem</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.key || item.label || i}>
                {values(item).map((cell, index) => (
                  <td key={index} data-sort={typeof cell === 'number' ? cell : undefined}>
                    {cell ?? '—'}
                  </td>
                ))}
                <td className="table-action-cell">
                  <button
                    type="button"
                    className="table-record-action"
                    onClick={() => setDetail(detail === i ? null : i)}
                  >
                    Conferir {(item.rows || []).length}{' '}
                    {(item.rows || []).length === 1 ? 'linha' : 'linhas'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>
      {detail != null && items[detail] && (
        <RecordDetails
          data={data}
          rows={items[detail].rows || []}
          title={title + ' · ' + (items[detail].label || '')}
        />
      )}
    </div>
  );
}
function Stack({ items }) {
  const [limit, setLimit] = useState('10');
  const valid = items.filter(
      (item) =>
        item.composition.count && item.composition.technician >= 0 && item.composition.travel >= 0,
    ),
    sorted = [...valid].sort(
      (a, b) =>
        b.composition.technician +
        b.composition.travel -
        (a.composition.technician + a.composition.travel),
    ),
    shown = limit === 'all' ? sorted : sorted.slice(0, Number(limit)),
    max = Math.max(
      1,
      ...shown.map((item) => item.composition.technician + item.composition.travel),
    );
  return (
    <>
      <label>
        Participantes{' '}
        <select value={limit} onChange={(event) => setLimit(event.target.value)}>
          <option value="10">10 maiores</option>
          <option value="20">20 maiores</option>
          <option value="all">Todos</option>
        </select>
      </label>
      <p className="scope">
        {shown.length} de {valid.length} grupos no gráfico. Verde: serviço técnico. Azul:
        deslocamento. Somente linhas com ambos os componentes válidos; grupos com componentes
        negativos ficam na tabela. A soma dos componentes não substitui o total lançado.
      </p>
      <div className="readable-bars">
        {shown.map((item) => (
          <div className="readable-bar-row" key={item.label}>
            <span className="bar-name">{item.label}</span>
            <div
              className="stack-track"
              aria-label={`Técnico ${currency(item.composition.technician)}, deslocamento ${currency(item.composition.travel)}`}
            >
              <span
                title={`Técnico: ${currency(item.composition.technician)}`}
                style={{
                  background: '#F59136',
                  width: (item.composition.technician / max) * 100 + '%',
                }}
              />
              <span
                title={`Deslocamento: ${currency(item.composition.travel)}`}
                style={{
                  background: '#3a7c94',
                  width: (item.composition.travel / max) * 100 + '%',
                }}
              />
            </div>
            <strong>{currency(item.composition.technician + item.composition.travel)}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
/** Apresenta custos, reincidência, chamados, intervenções e duração com detalhamento das linhas participantes. */
export function AdvancedInsights({
  original,
  data,
  devices,
  lifecycle,
  visibility,
  filename,
  filters,
}) {
  const [compositionBy, setCompositionBy] = useState('Razão Social'),
    [profileMetric, setProfileMetric] = useState('assistance'),
    [durationBy, setDurationBy] = useState('ID Rastreador'),
    [monthlyMetric, setMonthlyMetric] = useState('cost'),
    [vehicle, setVehicle] = useState('');
  const clients = groupedCosts(data),
    composition = groupedCosts(data, compositionBy),
    calls = callInsights(data),
    recurrence = recurringVisits(original, data),
    profiles = interventionProfiles(data, devices),
    durations = durationInsights(data, lifecycle, durationBy),
    monthly = monthlyCosts(data);
  const tableProps = { data, filename, filters },
    unavailable = (
      <p>Indisponível: faltam colunas necessárias ou a referência temporal é inválida.</p>
    );
  const totals = financialFields.map(([key, label]) => {
    const valid = (clients || []).filter((item) => item[key].count);
    return {
      label,
      value: valid.length ? valid.reduce((sum, item) => sum + item[key].sum, 0) : null,
      count: valid.reduce((sum, item) => sum + item[key].count, 0),
    };
  });
  const selectedVehicle = recurrence?.items.find((item) => item.key === vehicle);
  const profileLabels = {
    implementation: 'Implementações',
    assistance: 'Assistências técnicas',
    removal: 'Retiradas de rastreador',
    trackers: 'Eventos de troca de rastreador',
    collector: 'Trocas de coletora',
    rfid: 'Trocas de RFID',
  };
  return (
    <>
      <Section defaultOpen={false} title="Custo por cliente" visible={visibility.clientCosts}>
        {!clients ? (
          unavailable
        ) : (
          <>
            <InfoNote>
              Somente Concluída/Pago. Razão social identifica o cliente nesta etapa. Contratual não
              é recebimento ou lucro. Custo total em cobranças Addlog usa Custo Total; Contratual
              Addlog usa Valor a cobrar.
            </InfoNote>
            <div className="summary-grid">
              {totals.map((item) => (
                <div className="summary-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{currency(item.value)}</strong>
                  <small>{item.count} valores válidos</small>
                </div>
              ))}
            </div>
            <Chart
              ranking
              title="Custo total lançado por cliente"
              items={clients
                .filter((item) => item.cost.count)
                .map((item) => ({ label: item.label, value: item.cost.sum }))}
              format={currency}
            />
            <InsightTable
              {...tableProps}
              title="Custo por cliente"
              headers={[
                'Cliente',
                'Realizados',
                'Chamados',
                ...financialFields.map(([, label]) => label),
                'Custos válidos / realizados',
              ]}
              items={clients}
              values={(item) => [
                item.label,
                item.rows.length,
                item.calls.size,
                ...financialFields.map(([key]) => currency(metric(item[key]))),
                `${item.cost.count} / ${item.rows.length}`,
              ]}
            />
          </>
        )}
      </Section>
      <Section defaultOpen={false} title="Composição do custo" visible={visibility.costComposition}>
        {!composition ? (
          unavailable
        ) : (
          <>
            <label>
              Agrupar por{' '}
              <select
                value={compositionBy}
                onChange={(event) => setCompositionBy(event.target.value)}
              >
                <option>Razão Social</option>
                <option>Cidade</option>
                <option value="Cód.">Código do técnico</option>
              </select>
            </label>
            <Stack items={composition} />
            <InsightTable
              {...tableProps}
              title="Composição do custo"
              headers={[
                'Grupo',
                'Técnico (pares válidos)',
                'Deslocamento (pares válidos)',
                'Participação deslocamento nos componentes',
                'Pares válidos / realizados',
                'Total lançado (valores válidos)',
              ]}
              items={composition}
              values={(item) => [
                item.label,
                item.composition.count ? currency(item.composition.technician) : '—',
                item.composition.count ? currency(item.composition.travel) : '—',
                item.composition.technician + item.composition.travel > 0
                  ? number(
                      (item.composition.travel /
                        (item.composition.technician + item.composition.travel)) *
                        100,
                    ) + '%'
                  : '—',
                `${item.composition.count} / ${item.rows.length}`,
                currency(metric(item.cost)),
              ]}
            />
          </>
        )}
      </Section>
      <Section defaultOpen={false} title="Atendimentos por veículo" visible={visibility.recurrence}>
        {!recurrence ? (
          unavailable
        ) : (
          <>
            <p className="scope">
              Cliente + placa, com identificação exata. Cada linha Concluída/Pago conta como um
              atendimento no gráfico e na tabela. Datas distintas válidas são contadas
              separadamente; vários atendimentos no mesmo dia compartilham uma data. Retornos em até
              30/60/90 dias são cumulativos e contam intervalos entre visitas consecutivas, não
              veículos únicos. Não comprovam falha. O histórico completo define a visita seguinte;
              ambas as visitas precisam estar na seleção. {recurrence.missingIdentifier} realizados
              excluídos por cliente/placa ausente; {recurrence.missingDate} realizados sem data não
              entram nos intervalos.
            </p>
            <Chart
              ranking
              onItemClick={(item) =>
                setVehicle(recurrence.items.find((group) => group.label === item.label)?.key || '')
              }
              title="Atendimentos por cliente e placa"
              items={recurrence.items.map((item) => ({
                label: item.label,
                value: item.rows.length,
              }))}
            />
            <InsightTable
              {...tableProps}
              title="Atendimentos por veículo"
              headers={[
                'Cliente',
                'Placa',
                'Atendimentos (linhas)',
                'Datas distintas válidas',
                'Intervalos observados',
                'Até 30 dias',
                'Até 60 dias',
                'Até 90 dias',
                'Mediana do intervalo (dias)',
              ]}
              items={recurrence.items}
              values={(item) => [
                item.client,
                item.plate,
                item.rows.length,
                item.visits.length,
                item.intervals.length,
                item.within30,
                item.within60,
                item.within90,
                item.median,
              ]}
            />
            <label className="report-selection">
              Veículo para detalhes e linha do tempo{' '}
              <select value={vehicle} onChange={(event) => setVehicle(event.target.value)}>
                <option value="">Selecione…</option>
                {recurrence.items.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            {selectedVehicle && (
              <>
                <p className="scope">
                  <strong>
                    {selectedVehicle.rows.length} atendimentos em {selectedVehicle.visits.length}{' '}
                    datas distintas válidas.
                  </strong>{' '}
                  Atendimentos sem data válida permanecem na contagem de linhas.
                </p>
                <RecordDetails
                  data={data}
                  rows={selectedVehicle.rows}
                  title={selectedVehicle.label}
                />
                <h3 className="visit-timeline-heading">Linha do tempo dos atendimentos</h3>
                <ol className="visit-timeline">
                  {selectedVehicle.visits.map((visit) => (
                    <li key={visit.date}>
                      <strong>{day(visit.date)}</strong>
                      <span>
                        {visit.rows.length} {visit.rows.length === 1 ? 'serviço' : 'serviços'} ·{' '}
                        {visit.rows.length === 1 ? 'linha' : 'linhas'} {visit.rows.join(', ')}
                      </span>
                      {selectedVehicle.intervals
                        .filter((interval) => interval.end === visit.date)
                        .map((interval) => (
                          <small key={interval.start}>
                            {interval.days} dias desde a data de atendimento anterior registrada
                          </small>
                        ))}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </>
        )}
      </Section>
      <Section
        defaultOpen={false}
        title="Chamados com vários serviços"
        visible={visibility.multiCalls}
      >
        {!calls ? (
          unavailable
        ) : (
          <>
            <div className="summary-grid">
              {[
                ['Chamados com realizados', number(calls.items.length)],
                ['Chamados com mais de um realizado', number(calls.multiple.length)],
                ['Média de realizados por chamado', number(calls.average)],
              ].map(([label, value]) => (
                <div className="summary-card" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <InfoNote>
              Contagem de linhas realizadas, incluindo serviços no mesmo dia. Canceladas e agenda
              não entram. Cada chamado é contado uma vez na distribuição. Custo acumulado usa o
              total lançado válido; valores ausentes não viram zero.
            </InfoNote>
            <Chart
              title="Distribuição de serviços realizados por chamado"
              items={calls.distribution}
            />
            <InsightTable
              {...tableProps}
              title="Serviços por chamado"
              headers={[
                'Chamado',
                'Realizados',
                'Custo total',
                'Custo médio válido',
                'Custos válidos / realizados',
              ]}
              items={calls.items}
              values={(item) => [
                item.label,
                item.rows.length,
                currency(metric(item.cost)),
                currency(item.cost.count ? item.cost.sum / item.cost.count : null),
                `${item.cost.count} / ${item.rows.length}`,
              ]}
            />
          </>
        )}
      </Section>
      <Section
        defaultOpen={false}
        title="Perfil das intervenções por cliente"
        visible={visibility.interventions}
      >
        {!profiles ? (
          unavailable
        ) : (
          <>
            <InfoNote>
              Implementações e assistências usam Tipo de Serviço. Retiradas usam os motivos
              explícitos de desinstalação de rastreadores. Troca de rastreador é um evento com duas
              linhas; acessórios seguem as regras aprovadas. Categorias se sobrepõem e não devem ser
              somadas como total de atendimentos. Manutenção sem troca continua sem classificação.
              Trocas são atribuídas ao cliente da instalação; pares entre clientes diferentes exigem
              conferência.
            </InfoNote>
            <label>
              Intervenção no gráfico{' '}
              <select
                value={profileMetric}
                onChange={(event) => setProfileMetric(event.target.value)}
              >
                {Object.entries(profileLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {((profileMetric === 'collector' || profileMetric === 'rfid') &&
              !devices?.accessoryAvailable) ||
            (profileMetric === 'trackers' && !devices?.trackerAvailable) ? (
              <p>Categoria indisponível: faltam colunas de equipamentos.</p>
            ) : (
              <Chart
                ranking
                title={profileLabels[profileMetric] + ' por cliente'}
                items={profiles.map((item) => ({
                  label: item.label,
                  value:
                    ((profileMetric === 'collector' || profileMetric === 'rfid') &&
                      !devices?.accessoryAvailable) ||
                    (profileMetric === 'trackers' && !devices?.trackerAvailable)
                      ? 0
                      : item[profileMetric],
                }))}
              />
            )}
            <InsightTable
              {...tableProps}
              title="Perfil das intervenções"
              headers={['Cliente', 'Realizados', ...Object.values(profileLabels)]}
              items={profiles}
              values={(item) => [
                item.label,
                item.rows.length,
                ...Object.keys(profileLabels).map((key) =>
                  ((key === 'collector' || key === 'rfid') && !devices?.accessoryAvailable) ||
                  (key === 'trackers' && !devices?.trackerAvailable)
                    ? 'Indisponível'
                    : item[key],
                ),
              ]}
            />
          </>
        )}
      </Section>
      <Section
        defaultOpen={false}
        title="Tempo até retirada no histórico"
        visible={visibility.durationAnalysis}
      >
        {!durations ? (
          unavailable
        ) : (
          <>
            <InfoNote>
              Mediana e distribuição usam somente ciclos encerrados vinculados pelas regras
              aprovadas. Modelo identificado pelo prefixo do ID Rastreador da Implementação: 162 →
              MXT-162; 144 → MXT-130v2; 130/137 → MXT-130v1; 141/142/143 → MXT-141. Modelo original
              e cliente também podem ser usados para comparação. IDs sem prefixo reconhecido ficam
              em grupo separado e não são excluídos dos ciclos. Sem retirada registrada aparece
              separado e não entra na mediana. Retirada pode ser cancelamento; não representa
              automaticamente falha ou vida útil. Os filtros existentes também limitam os ciclos
              elegíveis.
            </InfoNote>
            <div className="summary-grid">
              {[
                ['Mediana até retirada (dias)', number(durations.median)],
                ['Ciclos encerrados', number(durations.closedCount)],
                ['Sem retirada registrada', number(durations.openCount)],
                ['Ciclos sem modelo pelo ID', number(durations.unknownModels)],
              ].map(([label, value]) => (
                <div className="summary-card" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <label>
              Comparar por{' '}
              <select value={durationBy} onChange={(event) => setDurationBy(event.target.value)}>
                <option value="ID Rastreador">Modelo pelo prefixo do ID</option>
                <option value="Modelo">Modelo original da planilha</option>
                <option>Razão Social</option>
              </select>
            </label>
            <Chart
              ranking
              title="Mediana de dias até retirada"
              items={durations.items
                .filter((item) => item.median != null)
                .map((item) => ({ label: item.label, value: item.median }))}
            />
            <Chart title="Distribuição dos ciclos encerrados" items={durations.bins} />
            <InsightTable
              {...tableProps}
              title="Duração observada"
              headers={[
                'Grupo',
                'Encerrados',
                'Sem retirada',
                'Mediana dias',
                'Tipos de serviço da retirada',
              ]}
              items={durations.items}
              values={(item) => [
                item.label,
                item.closed.length,
                item.open.length,
                item.median,
                [...item.motives].join(' / ') || '—',
              ]}
            />
          </>
        )}
      </Section>
      <Section defaultOpen={false} title="Evolução dos custos" visible={visibility.costEvolution}>
        {!monthly ? (
          unavailable
        ) : (
          <>
            <p className="scope">
              Data de atendimento; somente realizados. {monthly.missingDate} realizados excluídos
              por data ausente/inválida. Média usa custos totais válidos. Participação do
              deslocamento usa apenas linhas com Km e Custo Total válidos, no mesmo conjunto; total
              zero não gera percentual. Divergências podem produzir percentual acima de 100% e
              continuam em revisão.
            </p>
            <label>
              Medida mensal{' '}
              <select
                value={monthlyMetric}
                onChange={(event) => setMonthlyMetric(event.target.value)}
              >
                <option value="cost">Custo total lançado</option>
                <option value="volume">Atendimentos realizados</option>
                <option value="average">Custo médio por atendimento válido</option>
                <option value="share">Participação do deslocamento no total lançado</option>
              </select>
            </label>
            <Chart
              type="line"
              title="Evolução mensal"
              items={monthly.items
                .map((item) => ({
                  label: item.label,
                  value:
                    monthlyMetric === 'volume'
                      ? item.rows.length
                      : monthlyMetric === 'average'
                        ? item.cost.count
                          ? item.cost.sum / item.cost.count
                          : null
                        : monthlyMetric === 'share'
                          ? item.share.cost !== 0 && item.share.count
                            ? (item.share.travel / item.share.cost) * 100
                            : null
                          : metric(item.cost),
                }))
                .filter((item) => item.value != null)}
              format={
                monthlyMetric === 'volume'
                  ? number
                  : monthlyMetric === 'share'
                    ? (value) => number(value) + '%'
                    : currency
              }
            />
            <InsightTable
              {...tableProps}
              title="Evolução dos custos"
              headers={[
                'Mês',
                'Realizados',
                'Custo total',
                'Custo médio',
                'Deslocamento total válido',
                'Participação Km/total (pares válidos)',
                'Custos válidos / realizados',
                'Pares Km/total válidos',
              ]}
              items={monthly.items}
              values={(item) => [
                item.label,
                item.rows.length,
                currency(metric(item.cost)),
                currency(item.cost.count ? item.cost.sum / item.cost.count : null),
                currency(metric(item.travel)),
                item.share.count && item.share.cost !== 0
                  ? number((item.share.travel / item.share.cost) * 100) + '%'
                  : '—',
                `${item.cost.count} / ${item.rows.length}`,
                item.share.count,
              ]}
            />
          </>
        )}
      </Section>
    </>
  );
}
