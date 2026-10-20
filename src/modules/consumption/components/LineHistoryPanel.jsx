/** Histórico individual: apresenta busca, formulário, apurações e exportação sem controlar a persistência. */
import { TableScroll } from '../../../components/TableScroll.jsx';
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { chipKey } from '../domain/lineConsumption.js';
import { formatMB as mb } from '../utils/consumptionFormatting.js';
export function LineHistoryPanel({ visible, revealToken, chartNote, busy, followup, onSelect }) {
  const {
    tracked,
    lineSearch,
    setLineSearch,
    historyMatches,
    visibleChoices,
    timeline,
    trackedRow,
    notes,
    noteDate,
    setNoteDate,
    noteStatus,
    setNoteStatus,
    noteText,
    setNoteText,
    addNote,
    exportLineHistory,
  } = followup;
  return (
    <Section key={revealToken} title="Linha do tempo de consumo" visible={visible}>
      <InfoNote>
        Histórico local identificado por operadora + ICCID. Exibe todas as apurações em uso desse
        chip e as observações salvas, independentemente do período e dos filtros do topo. MB por dia
        divide o consumo pela duração da apuração; períodos sobrepostos não são somados. Marcações
        registram ações administrativas e não comprovam correção de falha. O cliente e o equipamento
        atuais vêm da referência operacional; cada anotação preserva o vínculo exibido na ação. CSV
        e XLSX incluem contexto, apurações e acompanhamento. Imprimir / Salvar PDF apresenta os
        registros salvos; o formulário e rascunhos ficam fora. Sem sincronização entre usuários: use
        o backup para proteger ou transferir os dados.
      </InfoNote>
      <label className="line-tracked-select" data-no-print>
        Buscar linha no histórico
        <input
          type="search"
          value={lineSearch}
          placeholder="Cliente, placa, número ou ICCID…"
          onChange={(event) => setLineSearch(event.target.value)}
        />
      </label>
      {lineSearch.trim() && (
        <div className="history-search-results" data-no-print>
          <p className="scope" role="status">
            {historyMatches.length} linhas encontradas. Clique em uma opção para abrir o histórico.
          </p>
          {!historyMatches.length && (
            <p className="scope">
              Nenhuma correspondência. Cliente e placa exigem vínculo confirmado com a planilha
              operacional; você também pode buscar pelo número ou ICCID.
            </p>
          )}
          <div className="history-search-list">
            {historyMatches.map((row) => (
              <button
                key={chipKey(row)}
                type="button"
                onClick={() => {
                  onSelect(chipKey(row));

                  setLineSearch('');
                }}
              >
                {row.link
                  ? `${row.link.client || 'Cliente não informado'} · ${row.link.plate || 'Placa não informada'}`
                  : 'Linha não identificada'}{' '}
                · {row.operator} · {row.number} · ICCID {row.iccid}
              </button>
            ))}
          </div>
        </div>
      )}
      <label className="line-tracked-select" data-no-print>
        Chip para acompanhar{' '}
        <select
          value={tracked}
          onChange={(event) => {
            onSelect(event.target.value);
          }}
        >
          <option value="">Selecione uma linha na tabela ou aqui</option>
          {visibleChoices.map((row) => (
            <option key={chipKey(row)} value={chipKey(row)}>
              {row.operator} · {row.number} · {row.iccid} ·{' '}
              {row.link
                ? `${row.link.client || 'Cliente não informado'} · ${row.link.plate || 'Placa não informada'}`
                : 'Linha não identificada'}
            </option>
          ))}
        </select>
      </label>
      {trackedRow ? (
        <>
          <button
            type="button"
            data-no-print
            onClick={() => {
              onSelect('');
            }}
          >
            Fechar histórico
          </button>
          <p className="scope">
            {trackedRow.operator} · MSISDN {trackedRow.number} · ICCID {trackedRow.iccid} ·
            referência atual:{' '}
            {trackedRow.link
              ? `${trackedRow.link.client || 'Cliente não informado'} · Placa ${trackedRow.link.plate || 'não informada'}`
              : 'Linha não identificada'}{' '}
            / ID {trackedRow.link?.serial || 'Não informado'}. A linha do tempo usa todas as
            apurações em uso desse chip, além do período selecionado no topo.
          </p>
          <div className="line-actions" data-no-print>
            <PermissionButton action="export" onClick={() => exportLineHistory('xlsx')}>
              Exportar histórico XLSX
            </PermissionButton>
            <PermissionButton action="export" onClick={() => exportLineHistory('csv')}>
              Exportar histórico CSV
            </PermissionButton>
          </div>
          <p className="scope">
            {timeline.length} apurações · {notes.length} observações salvas · última marcação por
            data da ação: {notes.at(-1)?.status || 'Sem acompanhamento'}.
          </p>
          {timeline.length < 2 && (
            <p className="notice">
              Há uma apuração deste chip. Importe novos períodos para acompanhar mudanças no
              consumo.
            </p>
          )}
          <div className="line-note-form" data-no-print>
            <label>
              Data da ação
              <input
                aria-label="Data da ação"
                type="date"
                value={noteDate}
                onChange={(event) => setNoteDate(event.target.value)}
              />
            </label>
            <label>
              Acompanhamento
              <select
                aria-label="Acompanhamento"
                value={noteStatus}
                onChange={(event) => setNoteStatus(event.target.value)}
              >
                {['Investigar', 'Ação realizada', 'Acompanhar', 'Encerrado'].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="line-note-text">
              Anotação
              <textarea
                aria-label="Anotação"
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Descreva a investigação, ajuste ou troca realizada…"
              />
            </label>
            <button disabled={busy || !noteText.trim() || !noteDate} onClick={addNote}>
              Salvar acompanhamento
            </button>
          </div>
          {!notes.length && <p className="scope">Nenhuma observação salva para esta linha.</p>}
          {!!notes.length && (
            <ul className="visit-timeline">
              {notes.map((note) => (
                <li key={note.id}>
                  <strong>{note.date.split('-').reverse().join('/')}</strong>
                  <div className="timeline-entry">
                    <span className="timeline-status">{note.status}</span>
                    <span className="timeline-text">{note.text}</span>
                    {note.plate && <small>Placa registrada na ação: {note.plate}</small>}
                    {note.serial && (
                      <small>
                        Equipamento registrado na ação: {note.serial} · {note.client}
                      </small>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Chart
            compact
            exportNote={chartNote}
            type="line"
            title="Consumo médio diário por apuração"
            items={timeline.map((row) => ({ label: row.period, value: row.mbDay }))}
            format={(value) => mb(value) + '/dia'}
          />
          <TableScroll label="Histórico da linha">
            <SortableTable>
              <thead>
                <tr>
                  {[
                    'Apuração',
                    'Dias',
                    'MSISDN',
                    'Consumo MB',
                    'MB por dia',
                    'Arquivo',
                    'Linha CSV',
                  ].map((label) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeline.map((row) => (
                  <tr key={row.id}>
                    <td>{row.period}</td>
                    <td>{row.days}</td>
                    <td>{row.number}</td>
                    <td data-sort={row.ticks}>{mb(row.mb)}</td>
                    <td data-sort={row.mbDay}>{mb(row.mbDay)}</td>
                    <td>{row.filename}</td>
                    <td>{row.sourceRow}</td>
                  </tr>
                ))}
              </tbody>
            </SortableTable>
          </TableScroll>
          <InfoNote>
            Apurações semanais e mensais podem se sobrepor. São observações separadas, sem somar
            snapshots ou presumir o consumo de dias individuais.
          </InfoNote>
        </>
      ) : (
        <p className="scope">
          Selecione um chip para ver seu histórico e registrar as ações de investigação.
        </p>
      )}
    </Section>
  );
}
