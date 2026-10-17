/** Tabela dos ciclos observados, situação e referência; recebe vínculos já calculados. */
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { sectionLabels } from '../config/preferences.js';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { todaySaoPaulo } from '../domain/lifecycle.js';

/** Apresenta o recorte e as ações recebidas; a base original permanece no controlador. */
export function OrdersLifecyclePanel({
  lifecycle,
  displayedPeriods,
  cycleState,
  setCycleState,
  referenceDate,
  setReferenceDate,
  visible,
}) {
  return (
    <Section
      title={sectionLabels.lifecycle}
      visible={visible}
      summary={
        !lifecycle.unavailable &&
        !lifecycle.invalidReference && (
          <ReportSummary
            metrics={[
              ['Períodos exibidos', displayedPeriods.length],
              [
                'Encerrados no recorte exibido',
                displayedPeriods.filter((period) => period.state === 'Encerrado').length,
              ],
              [
                'Sem retirada no recorte exibido',
                displayedPeriods.filter((period) => period.state === 'Sem retirada registrada')
                  .length,
              ],
              ['Períodos antes do filtro de situação', lifecycle.periods.length],
            ]}
            note={`Situação: ${cycleState}. Referência ${referenceDate || 'indisponível'} para ciclos sem retirada. Encerrado significa retirada registrada, não necessariamente troca ou fim de vida útil. Mesmos filtros da tabela completa.`}
          />
        )
      }
    >
      <section className="panel chart-panel">
        <h2>Tempo observado em campo</h2>
        <div className="lifecycle-controls" data-no-print>
          <label>
            Situação dos ciclos{' '}
            <select value={cycleState} onChange={(event) => setCycleState(event.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Encerrado">Encerrados</option>
              <option value="Sem retirada registrada">Sem retirada registrada</option>
            </select>
          </label>
          <label>
            Referência para períodos sem retirada{' '}
            <input
              type="date"
              value={referenceDate}
              onChange={(event) => setReferenceDate(event.target.value)}
            />
          </label>
          <button onClick={() => setReferenceDate(todaySaoPaulo())}>Usar data atual</button>
        </div>
        <InfoNote>
          Mesmo serial e placa, instalação anterior à retirada. Vínculos analisados no arquivo
          completo; ambos os registros precisam atender aos filtros. Várias instalações sem retirada
          intermediária vão para Revisão. Início somente por Implementação. Sem retirada registrada:
          duração até a referência, sem confirmar atividade ou ausência de problemas. A referência
          afeta apenas ciclos sem retirada; ciclos encerrados mantêm suas datas reais. Dias corridos
          até retirada, inclusive cancelamento. Para medir até primeira troca, use a seção Vida em
          campo até primeira troca. Situação dos ciclos filtra somente a tabela e a impressão desta
          seção, depois de aplicar os filtros principais. Não modifica os demais indicadores nem
          remove avisos de revisão. Encerrado significa retirada registrada, não necessariamente
          troca de equipamento.
        </InfoNote>
        {lifecycle.unavailable ? (
          <p>Indisponível: faltam colunas.</p>
        ) : lifecycle.invalidReference ? (
          <p role="alert">Escolha uma data de referência válida.</p>
        ) : (
          <>
            <p>
              {displayedPeriods.length} de {lifecycle.periods.length} períodos exibidos. Situação:{' '}
              {cycleState === 'Encerrado' ? 'Encerrados' : cycleState}.
            </p>
            {!displayedPeriods.length && (
              <p>Nenhum ciclo corresponde à situação selecionada e aos filtros da página.</p>
            )}
            <div className="table-scroll">
              <SortableTable>
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Serial</th>
                    <th>Instalação</th>
                    <th>Retirada / referência</th>
                    <th>Situação</th>
                    <th>Dias</th>
                    <th>Linhas Excel</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPeriods.map((period) => (
                    <tr key={period.installationRow}>
                      <td>{period.plate}</td>
                      <td>{period.serial}</td>
                      <td>{period.start}</td>
                      <td>{period.end}</td>
                      <td>{period.state}</td>
                      <td>{period.days}</td>
                      <td>
                        {period.installationRow} → {period.removalRow ?? 'sem retirada'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </SortableTable>
            </div>
          </>
        )}
      </section>
    </Section>
  );
}
