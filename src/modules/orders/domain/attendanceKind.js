/** Classificação explícita aprovada: improdutividade vem do Motivo, sem inferir pelo texto livre. */
import { field } from '../../../shared/data/filters.js';

export function isUnproductive(data, row) {
  return (
    String(field(data, row, 'Motivo')?.raw || '')
      .trim()
      .toLocaleLowerCase('pt-BR') === 'visita improdutiva'
  );
}

export function matchesAttendanceKind(data, row, mode = 'productive') {
  return (
    mode === 'all' ||
    (mode === 'unproductive' ? isUnproductive(data, row) : !isUnproductive(data, row))
  );
}
