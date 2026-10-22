/** Fonte atual e laboratório de coexistência; exemplos isolados não entram em arquivos, anotações ou totais. */
import React, { useState } from 'react';
import { Section } from '../../../components/Section.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { planConsumptionSources, sourcePlanTotal } from '../domain/consumptionSources.js';
import { VOLUME_SCALE } from '../domain/lineConsumption.js';
import { formatVolume } from '../utils/consumptionFormatting.js';

const title = 'Fontes de consumo e preparação das APIs';
function example(kind, id, mb, observedAt = '2026-10-17T10:00:00Z') {
  return {
    id,
    kind,
    operator: 'Arqia',
    connectionKey: kind + '-exemplo',
    accountKey: 'conta-ficticia',
    periodBasis: 'dias-inclusivos-America/Sao_Paulo-validado',
    start: '2026-10-01',
    end: '2026-10-15',
    observedAt,
    complete: true,
    rows: [{ iccid: '000000001', number: '000000002', ticks: mb * VOLUME_SCALE }],
  };
}
export function ConsumptionSourcesPanel({ archive, visible }) {
  const [scenario, setScenario] = useState('revision');
  const [choice, setChoice] = useState('');
  const first = example('api', 'api-primeira', 100);
  const revised = example('api', 'api-revisada', 120, '2026-10-17T11:00:00Z');
  const csv = example('csv', 'csv-exemplo', 115);
  const observations =
    scenario === 'repeat'
      ? [first, first]
      : scenario === 'conflict'
        ? [csv, revised]
        : scenario === 'partial'
          ? [first, { ...revised, complete: false }]
          : [first, revised];
  const preliminary = planConsumptionSources(observations);
  const plan = planConsumptionSources(
    observations,
    choice ? { [preliminary.groups[0]?.key]: choice } : {},
  );
  return (
    <Section
      title={title}
      visible={visible}
      help="KORE/Saitro possui piloto separado de consulta manual. Arqia ainda aguarda documentação e acesso. A origem dos indicadores atuais continua sendo CSV local. A prévia usa apenas dados fictícios isolados; não consulta operadoras, não importa registros e não altera notas ou backups. Revisões substituem a observação da mesma conexão/conta/período; fontes diferentes exigem escolha explícita. Datas, unidades e conta devem ser normalizadas por adaptadores validados antes da coleta real."
      summary={
        <ReportSummary
          metrics={[
            ['Arquivos locais', archive.files.length],
            ['Versões em uso', archive.files.filter((file) => file.active !== false).length],
            ['Fonte dos indicadores', 'CSV local'],
          ]}
          note="CSV continua alimentando os indicadores. KORE possui consulta manual separada, em bytes e BRT; equivalência de período e apuração aguarda homologação."
        />
      }
    >
      <p className="scope">
        Fonte atual: arquivos CSV salvos neste navegador. O total de arquivos é do histórico
        completo e não segue os filtros de consumo desta categoria.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Operadora</th>
              <th>Integração prevista</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>KORE Brasil / Saitro</td>
              <td>Linhas e consumo</td>
              <td>Piloto na página KORE; bytes e BRT confirmados, período pendente</td>
            </tr>
            <tr>
              <td>Arqia</td>
              <td>Linhas e consumo</td>
              <td>Aguardando documentação técnica e liberação</td>
            </tr>
          </tbody>
        </table>
      </div>
      <details className="integration-preview" data-no-print>
        <summary>Prévia de convivência CSV e API · dados fictícios</summary>
        <p className="notice">
          SIMULAÇÃO. Os valores abaixo não pertencem à Addlog e não entram nos indicadores reais,
          histórico local ou relatórios de consumo.
        </p>
        <div className="integration-preview-controls">
          <label>
            Cenário de validação
            <select
              aria-label="Cenário de validação"
              value={scenario}
              onChange={(event) => {
                setScenario(event.target.value);
                setChoice('');
              }}
            >
              <option value="revision">Acumulado revisado: 100 → 120 MB</option>
              <option value="repeat">Mesma resposta recebida duas vezes</option>
              <option value="conflict">CSV e API no mesmo período</option>
              <option value="partial">Coleta incompleta após uma válida</option>
            </select>
          </label>
          {scenario === 'conflict' && (
            <label>
              Observação escolhida na simulação
              <select
                aria-label="Observação escolhida na simulação"
                value={choice}
                onChange={(event) => setChoice(event.target.value)}
              >
                <option value="">Aguardando escolha</option>
                <option value="csv-exemplo">CSV fictício · 115 MB</option>
                <option value="api-revisada">API fictícia · 120 MB</option>
              </select>
            </label>
          )}
        </div>
        <ReportSummary
          metrics={[
            ['Observações recebidas', observations.length],
            ['Observações em uso', plan.selected.length],
            [
              'Total da simulação',
              sourcePlanTotal(plan) == null
                ? 'Aguardando conferência'
                : formatVolume(sourcePlanTotal(plan)),
            ],
            ['Observações recusadas', plan.invalid.length],
          ]}
          note="Conta fictícia e período de 01 a 15/10/2026. A observação revisada substitui a anterior; CSV e API não são somados. Uma coleta incompleta conserva a última completa."
        />
        {plan.groups
          .filter((group) => group.reason)
          .map((group) => (
            <p role="status" className="notice" key={group.key}>
              {group.reason}
            </p>
          ))}
      </details>
      <p className="scope">
        Antes de conectar: validar conta, período/fuso, unidades, paginação e atraso dos dados.
        Notas permanecem ligadas à operadora + ICCID. Não há alteração do armazenamento nem coleta
        periódica ativa nesta preparação.
      </p>
    </Section>
  );
}
