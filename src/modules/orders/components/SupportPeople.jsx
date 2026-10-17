/** Cards de pessoas e investigação local, sem transformar a busca visual em filtro dos relatórios. */
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { Icon } from '../../../components/Icon.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { download } from '../../../shared/export/exports.js';
import { supportPerson } from '../domain/supportPerson.js';
import {
  supportReport,
  supportComparisonReport,
  supportCsv,
  supportWorkbook,
} from '../domain/supportReport.js';
import { RecordDetails } from './RecordDetails.jsx';
import {
  SupportDelta,
  SupportMetricCards,
  supportNumber,
  supportPercent,
} from './SupportMetricCards.jsx';

const searchKey = (value) =>
  value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');

function PersonRole({ original, result }) {
  return (
    <section
      className="support-person-role"
      aria-label={`Detalhes de ${result.person} · ${result.role.label}`}
    >
      <h4>{result.role.label}</h4>
      <p className="scope">
        Data: {result.role.date} · {supportNumber(result.totals.visits)} visitas e atendimentos ·{' '}
        {supportPercent(result.share)} dos efetivos do papel.
      </p>
      <SupportMetricCards results={[result]} extraOnly />
      <p className="scope">
        {result.totals.vehicles == null
          ? 'Identificação de veículos indisponível.'
          : `${supportNumber(result.totals.vehiclesMissing)} linhas sem cliente + placa utilizáveis.`}{' '}
        {result.missingDates} realizados sem data excluídos pelo período; {result.undated} sem data
        fora da evolução.
      </p>
      <div className="support-person-breakdowns">
        <div>
          <h5>Perfil dos serviços</h5>
          <div className="table-scroll">
            <SortableTable aria-label={`Perfil de ${result.person} · ${result.role.label}`}>
              <thead>
                <tr>
                  <th>Serviço / visita</th>
                  <th>Registros</th>
                  <th>% do total realizado</th>
                </tr>
              </thead>
              <tbody>
                {result.profiles.map((item) => (
                  <tr key={item.type}>
                    <td>{item.type}</td>
                    <td>{item.value}</td>
                    <td data-sort={result.totals.visits ? item.value / result.totals.visits : null}>
                      {supportPercent(
                        result.totals.visits ? item.value / result.totals.visits : null,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </SortableTable>
          </div>
        </div>
        <div>
          <h5>Clientes por volume de registros</h5>
          <div className="table-scroll">
            <SortableTable aria-label={`Clientes de ${result.person} · ${result.role.label}`}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Visitas e atendimentos</th>
                </tr>
              </thead>
              <tbody>
                {result.clientGroups.map((item, index) => (
                  <tr key={index}>
                    <td>{item.label}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </SortableTable>
          </div>
        </div>
      </div>
      {!result.rows.length && (
        <p className="scope">Sem registros desta pessoa neste papel e recorte.</p>
      )}
      <details className="support-person-evolution">
        <summary>Evolução dos atendimentos · {result.role.label}</summary>
        <p className="scope">
          {result.unit === 'day' ? 'Agrupamento diário' : 'Agrupamento mensal'} pela{' '}
          {result.role.date}. Não preenche dias sem registro nem mede tempo trabalhado.
        </p>
        <Chart
          compact
          type="line"
          title={`Efetivos · ${result.person} · ${result.role.label}`}
          items={result.periods.map((item) => ({ label: item.label, value: item.productive }))}
        />
        <div className="table-scroll">
          <SortableTable aria-label={`Evolução de ${result.person} · ${result.role.label}`}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Efetivos</th>
                <th>Improdutivas</th>
              </tr>
            </thead>
            <tbody>
              {result.periods.map((item) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  <td>{item.productive}</td>
                  <td>{item.unproductive}</td>
                </tr>
              ))}
            </tbody>
          </SortableTable>
        </div>
      </details>
      <details className="support-person-source">
        <summary>
          Conferir {result.rows.length} linhas originais · {result.role.label}
        </summary>
        <RecordDetails
          compact
          data={original}
          rows={result.rows.map((row) => row.sourceRow)}
          title={`${result.person} · ${result.role.label}`}
        />
      </details>
    </section>
  );
}

export function SupportPeople({ original, results, filters, filename }) {
  const [person, setPerson] = useState(null),
    [search, setSearch] = useState(''),
    [showAll, setShowAll] = useState(false);
  const panelId = useId(),
    panel = useRef(null),
    triggers = useRef(new Map());
  const execution = results.execution,
    scheduling = results.scheduling;
  // A edição do recorte ou da fonte encerra a investigação antiga; mudar a apresentação não muda os dados.
  useEffect(() => {
    setPerson(null);
    setSearch('');
    setShowAll(false);
  }, [original, execution, scheduling]);
  useEffect(() => {
    if (person)
      panel.current?.scrollIntoView({
        block: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
  }, [person]);
  const roles = ['scheduling', 'execution']
    .filter((key) => results[key])
    .map((key) => [key, results[key]]);
  const names = [
    ...new Set(roles.flatMap(([, result]) => result.groups.map((group) => group.label))),
  ].sort((a, b) => {
    const score = (name) =>
      Math.max(
        ...roles.map(
          ([, result]) => result.groups.find((group) => group.label === name)?.productive ?? 0,
        ),
      );
    return score(b) - score(a) || a.localeCompare(b, 'pt-BR');
  });
  const matching = names.filter((name) => searchKey(name).includes(searchKey(search.trim()))),
    shown = showAll ? matching : matching.slice(0, 6);
  const selected = useMemo(
    () =>
      person
        ? Object.fromEntries(
            ['scheduling', 'execution']
              .filter((key) => results[key])
              .map((key) => [key, results[key]])
              .map(([key, result]) => [key, supportPerson(original, result, person)]),
          )
        : null,
    [original, execution, scheduling, person],
  );
  const exportPerson = (format) => {
    const tables =
      selected.execution && selected.scheduling
        ? supportComparisonReport(
            original,
            selected.execution,
            selected.scheduling,
            filters,
            filename,
          )
        : supportReport(original, Object.values(selected)[0], filters, filename);
    return download(
      format === 'csv' ? supportCsv(tables) : supportWorkbook(tables),
      format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      `suporte-responsavel.${format}`,
    );
  };
  const close = () => {
    triggers.current.get(person)?.focus();
    setPerson(null);
  };
  return (
    <section className="support-people" aria-label="Responsáveis do suporte">
      <div className="inline-help-heading">
        <h3>Atendimentos por responsável</h3>
        <InfoNote label="Regras dos cards por responsável">
          Nomes utilizáveis do recorte atual, ignorando somente espaços externos, sem unir grafias
          parecidas. As contagens incluem apenas Concluída/Pago. Participação = efetivos da pessoa /
          todos os efetivos do mesmo papel, inclusive sem responsável. Em Ambos, ordem pelo maior
          volume individual de efetivos entre os papéis, sem soma. A busca e o limite organizam
          somente os cards; não filtram totais, ranking ou exportação da equipe. Clicar no nome abre
          a pessoa, com exportação própria. Volume e improdutivas não medem qualidade individual nem
          atribuem culpa.
        </InfoNote>
      </div>
      <div className="support-people-controls" data-no-print>
        <label>
          Buscar responsável nos cards
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPerson(null);
            }}
            placeholder="Nome do responsável"
          />
        </label>
        <span>
          {shown.length} de {matching.length} responsáveis
          {search ? ` encontrados entre ${names.length}` : ''} · busca somente nos cards
        </span>
        {matching.length > 6 && (
          <button
            type="button"
            onClick={() => {
              setShowAll((value) => !value);
              setPerson(null);
            }}
          >
            {showAll ? 'Mostrar 6 responsáveis' : 'Mostrar todos os responsáveis'}
          </button>
        )}
      </div>
      {!shown.length && (
        <p className="scope">Nenhum responsável encontrado nos cards para esta seleção.</p>
      )}
      <div className="support-person-grid">
        {shown.map((name) => (
          <article
            key={name}
            className={`support-person-card${person === name ? ' is-selected' : ''}`}
            data-person={name}
          >
            <button
              className="support-person-trigger"
              type="button"
              ref={(element) => {
                if (element) triggers.current.set(name, element);
                else triggers.current.delete(name);
              }}
              aria-expanded={person === name}
              aria-controls={person === name ? panelId : undefined}
              onClick={() => setPerson((previous) => (previous === name ? null : name))}
            >
              <Icon name="users" size={17} />
              <strong>{name}</strong>
              <span>{person === name ? 'Recolher' : 'Ver detalhes'}</span>
            </button>
            <div className="support-person-values">
              {roles.map(([key, result]) => {
                const group = result.groups.find((item) => item.label === name);
                return (
                  <div key={key}>
                    <span className="support-role-label">{result.role.label}</span>
                    <dl>
                      {[
                        ['productive', 'Efetivos'],
                        ['unproductive', 'Improdutivas'],
                        ['calls', 'Chamados'],
                        ['clients', 'Clientes'],
                      ].map(([metric, label]) => (
                        <div key={metric}>
                          <dt>{label}</dt>
                          <dd>{supportNumber(group?.[metric] ?? 0)}</dd>
                        </div>
                      ))}
                    </dl>
                    <small>
                      {supportPercent(group?.share ?? (result.totals.productive ? 0 : null))} dos
                      efetivos do papel
                    </small>
                    {result.past && (
                      <SupportDelta
                        current={group?.productive ?? 0}
                        previous={
                          result.past.groups.find((item) => item.label === name)?.productive ?? 0
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
      {selected && (
        <section
          className="support-person-detail"
          id={panelId}
          ref={panel}
          aria-label={`Acompanhamento de ${person}`}
        >
          <div className="inline-help-heading">
            <h3>{person} · detalhamento</h3>
            <button type="button" className="support-person-close" onClick={close}>
              Fechar detalhes
            </button>
            <InfoNote label="Regras do detalhamento por pessoa">
              Este painel mostra somente a pessoa selecionada, com os filtros da categoria e cada
              data de responsabilidade preservados. Perfil e clientes incluem todas as linhas
              realizadas, com improdutivas separadas no perfil. Percentuais do perfil usam o total
              realizado da pessoa; a participação nos cards continua usando a equipe do papel.
              Evolução e linhas originais podem ser abertas abaixo. Exportar responsável inclui
              somente essa pessoa; em Ambos, os papéis permanecem separados e cada linha original é
              gravada uma vez.
            </InfoNote>
          </div>
          <p className="scope">
            Período: {filters.start || 'início do histórico'} até{' '}
            {filters.end || 'fim do histórico'}. Números por papel; não somar agendamentos e
            execuções como atendimentos únicos.
          </p>
          <div className="support-person-export" data-no-print>
            <PermissionButton action="export" onClick={() => exportPerson('xlsx')}>
              Exportar responsável XLSX
            </PermissionButton>
            <PermissionButton action="export" onClick={() => exportPerson('csv')}>
              Exportar responsável CSV
            </PermissionButton>
          </div>
          <div className="support-person-role-grid">
            {Object.entries(selected).map(([key, result]) => (
              <PersonRole key={`${person}:${key}`} original={original} result={result} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
