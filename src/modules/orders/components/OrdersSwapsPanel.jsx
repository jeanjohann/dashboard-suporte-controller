/** Relatório de trocas de equipamentos e pares de rastreadores com linhas de origem. */
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { sectionLabels } from '../config/preferences.js';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { BarChart } from '../../../components/BarChart.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';

/** Apresenta o recorte e as ações recebidas; a base original permanece no controlador. */
export function OrdersSwapsPanel({ devices, visible }) {
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
            ['Acessórios sem troca/categoria confirmada', devices.excludedAccessories ?? null],
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
            linha = um acessório. Categoria ausente ou ambígua e manutenção sem troca confirmada
            ficam na revisão.
          </InfoNote>
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
              description={`${devices.swaps.length} trocas identificadas; ${devices.missingMonthlyDate} sem data da instalação no gráfico. O par é identificado na importação completa e só entra se ambas as linhas atenderem aos filtros. Reinstalações entram somente quando há o par completo de retirada/entrada, na mesma data e cliente, com seriais diferentes.`}
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
                      <th>Linhas Excel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.swaps.map((swap) => (
                      <tr key={swap.installationRow}>
                        <td>{swap.os}</td>
                        <td>{swap.plate}</td>
                        <td>{swap.oldSerial}</td>
                        <td>{swap.newSerial}</td>
                        <td>
                          {swap.removalRow} → {swap.installationRow}
                        </td>
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
      </section>
    </Section>
  );
}
