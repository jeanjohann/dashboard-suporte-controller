/** Acompanhamento por operadora + ICCID, independente dos filtros da grade e com rascunho separado do salvo. */
import { useEffect, useState } from 'react';
import { chipKey, lineTimeline } from '../domain/lineConsumption.js';
import { currentDate as today } from '../utils/consumptionFormatting.js';
import { authorizeAction } from '../../../shared/security/accessClient.js';
import { download } from '../../../shared/export/exports.js';
import {
  lineHistoryReport,
  lineHistoryCsv,
  lineHistoryWorkbook,
} from '../domain/lineHistoryReport.js';
export function useLineFollowup({ allRows, archive, commit, setError }) {
  const [tracked, setTracked] = useState(''),
    [noteText, setNoteText] = useState(''),
    [noteDate, setNoteDate] = useState(today),
    [noteStatus, setNoteStatus] = useState('Investigar');
  const [lineSearch, setLineSearch] = useState('');
  const historyChoices = [
    ...new Map(
      allRows.filter((row) => row.service === 'dados').map((row) => [chipKey(row), row]),
    ).values(),
  ].sort((a, b) => a.number.localeCompare(b.number));
  const matchesHistorySearch = (row) =>
    [row.number, row.iccid, row.operator, row.link?.client, row.link?.plate].some((value) =>
      String(value || '')
        .toLocaleLowerCase('pt-BR')
        .includes(lineSearch.trim().toLocaleLowerCase('pt-BR')),
    );
  const historyMatches = lineSearch.trim() ? historyChoices.filter(matchesHistorySearch) : [];
  const visibleChoices = historyChoices.filter(
    (row) => chipKey(row) === tracked || !lineSearch.trim() || matchesHistorySearch(row),
  );

  const timeline = lineTimeline(allRows, tracked),
    trackedRow = timeline.at(-1),
    notes = archive.notes
      .filter(
        (note) =>
          trackedRow && note.operator === trackedRow.operator && note.iccid === trackedRow.iccid,
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  // Trocar de chip limpa o rascunho; salvar ou atualizar dados do chip não deve apagar uma edição em andamento.
  useEffect(() => {
    setNoteText('');
    setNoteDate(today());
    setNoteStatus(notes.at(-1)?.status || 'Investigar');
  }, [tracked]);

  async function exportLineHistory(format) {
    if (!trackedRow || !(await authorizeAction('export'))) return;
    try {
      const report = lineHistoryReport(timeline, notes);
      const filename = 'historico-linha-' + trackedRow.iccid.replace(/[^a-zA-Z0-9_-]/g, '_');
      if (format === 'xlsx') {
        await download(
          lineHistoryWorkbook(report),
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename + '.xlsx',
        );
      } else {
        await download(lineHistoryCsv(report), 'text/csv;charset=utf-8', filename + '.csv');
      }
    } catch (error) {
      setError('Não foi possível gerar o histórico. ' + error.message);
    }
  }

  async function addNote() {
    if (
      !trackedRow ||
      !noteText.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(noteDate) ||
      !Number.isFinite(Date.parse(noteDate)) ||
      new Date(noteDate).toISOString().slice(0, 10) !== noteDate
    )
      return;
    const note = {
      id: crypto.randomUUID(),
      operator: trackedRow.operator,
      iccid: trackedRow.iccid,
      date: noteDate,
      status: noteStatus,
      text: noteText.trim(),
      client: trackedRow.link?.client || '',
      plate: trackedRow.link?.plate || '',
      serial: trackedRow.link?.serial || '',
    };
    try {
      await commit(
        { ...archive, notes: [...archive.notes, note] },
        'Acompanhamento salvo no histórico.',
      );
      setNoteText('');
    } catch {
      // O controle de persistência apresenta o erro; o rascunho permanece para nova tentativa.
    }
  }

  return {
    tracked,
    setTracked,
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
  };
}
