/** Relatório de trocas de equipamentos e pares de rastreadores com linhas de origem. */
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { sectionLabels } from '../config/preferences.js';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { BarChart } from '../../../components/BarChart.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { ReplacementRankings } from './ReplacementRankings.jsx';

/** Apresenta o recorte e as ações recebidas; a base original permanece no controlador. */
export function OrdersSwapsPanel({ data, devices, visible }) {
  return (
    <Section
      title={sectionLabels.swaps}
      visible={visible}
      summary={
        <ReportSummary
          metrics={[
            ['Trocas de rastreador', devices.trackerAvailable ? devices.swaps.length : null],
            [
              'Coletoras / terminais',
              devices.accessoryAvailable ? devices.accessories.Coletora : null,
            ],
            ['RFID', devices.accessoryAvailable ? devices.accessories.RFID : null],
            [
              'Manutenção sem troca · rastreador/kit',
              devices.trackerAvailable ? devices.withoutReplacement.length : null,
            ],
            [
              'Coletoras sem troca',
              devices.accessoryAvailable
                ? devices.accessoryWithoutReplacement.Coletora.length
                : null,
            ],
            [
              'RFID sem troca',
              devices.accessoryAvailable ? devices.accessoryWithoutReplacement.RFID.length : null,
            ],
            ['Acessórios para revisão', devices.excludedAccessories ?? null],
          ]}
          note="Pares de rastreador e acessórios usam critérios próprios, com Concluída/Pago. Não somar categorias como se fossem a mesma unidade. Campos indisponíveis ficam sem valor; origens continuam na visão completa."
        />
      }
    >
      <section className="panel chart-panel">
        <div className="inline-help-heading">
          <h2>Trocas de equipamentos</h2>
          <InfoNote>
            Troca/trocar explícito nas instruções, somente Assistência Técnica / Manutenção de
            Acessório Concluída/Pago. Coletora, teclado e terminal pertencem à mesma categoria. Uma
            linha = um acessório. Sem troca explícita, a manutenção fica separada das substituições;
            categoria ausente ou ambígua continua na revisão. Uma linha/ID de rastreador no chamado
            e veículo confirma manutenção sem troca; duas linhas com IDs distintos confirmam um
            evento.
          </InfoNote>
        </div>
        <div className="summary-grid">
          {[
            [
              'Rastreador/kit sem troca',
              devices.trackerAvailable ? devices.withoutReplacement.length : null,
              'Uma linha com um ID válido por chamado e placa.',
            ],
            [
              'Trocas de rastreador/kit',
              devices.trackerAvailable ? devices.swaps.length : null,
              'Duas linhas com IDs válidos distintos por chamado e placa; um evento.',
            ],
            [
              'Coletoras sem troca',
              devices.accessoryAvailable
                ? devices.accessoryWithoutReplacement.Coletora.length
                : null,
              'Manutenção de Acessório, categoria coletora/teclado/terminal, sem troca explícita.',
            ],
            [
              'RFID sem troca',
              devices.accessoryAvailable ? devices.accessoryWithoutReplacement.RFID.length : null,
              'Manutenção de Acessório, categoria RFID, sem troca explícita.',
            ],
          ].map(([label, value, note]) => (
            <article className="summary-card" key={label}>
              <span>{label}</span>
              <strong>{value ?? '—'}</strong>
              <small>{note}</small>
            </article>
          ))}
        </div>
        {devices.accessoryAvailable ? (
          <BarChart
            title="Trocas de acessórios por categoria"
            description={`${devices.excludedAccessories} linhas excluídas desta contagem para revisão. Somente Assistência Técnica / Manutenção de Acessório realizada.`}
            items={Object.entries(devices.accessories).map(([label, value]) => ({
              label,
              value,
            }))}
          />
        ) : (
          <p>Acessórios indisponíveis: faltam cabeçalhos.</p>
        )}
        {devices.trackerAvailable ? (
          <>
            <BarChart
              title="Trocas de rastreador por mês"
              description={`${devices.swaps.length} eventos confirmados no arquivo completo; ${devices.missingMonthlyDate} sem data comum ficam fora do gráfico mensal. Ambas as linhas devem atender aos filtros. A direção retirada/entrada é mostrada somente quando os motivos a identificam; isso não é inferido pela ordem das linhas.`}
              items={devices.months}
            />
            <details className="report-details">
              <summary>Conferir pares de rastreadores ({devices.swaps.length})</summary>
              <div className="table-scroll">
                <SortableTable>
                  <thead>
                    <tr>
                      <th>Chamado</th>
                      <th>Placa</th>
                      <th>Retirado</th>
                      <th>Instalado</th>
                      <th>IDs registrados</th>
                      <th>Vida em campo</th>
                      <th>Linhas Excel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.swaps.map((swap) => (
                      <tr key={swap.rows.join('-')}>
                        <td>{swap.os}</td>
                        <td>{swap.plate}</td>
                        <td>{swap.oldSerial || 'Não definido'}</td>
                        <td>{swap.newSerial || 'Não definido'}</td>
                        <td>{swap.serials.join(' / ')}</td>
                        <td>
                          {swap.lifecycleEligible
                            ? 'Direção e data utilizáveis'
                            : 'Requer direção, cliente e data comuns'}
                        </td>
                        <td>{swap.rows.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </div>
            </details>
            <details className="report-details">
              <summary>
                Conferir manutenção sem troca · rastreador/kit ({devices.withoutReplacement.length})
              </summary>
              <div className="table-scroll">
                <SortableTable>
                  <thead>
                    <tr>
                      <th>Chamado</th>
                      <th>Placa</th>
                      <th>ID rastreador</th>
                      <th>Linha Excel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.withoutReplacement.map((item) => (
                      <tr key={item.rows[0]}>
                        <td>{item.os}</td>
                        <td>{item.plate}</td>
                        <td>{item.serial}</td>
                        <td>{item.rows.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </div>
            </details>
          </>
        ) : (
          <p>Rastreadores indisponíveis: faltam cabeçalhos.</p>
        )}
        <InfoNote>
          Períodos encerrados aparecem na seção Tempo observado em campo. Períodos sem retirada usam
          a referência escolhida na seção Tempo observado em campo.
        </InfoNote>
        <ReplacementRankings data={data} events={devices.replacementEvents} />
      </section>
    </Section>
  );
}
