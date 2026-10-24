import { validISODate } from '../../../shared/data/isoDate.js';
import { consumptionEligible, exactSum, importLineStatement } from './lineConsumption.js';

/** Prévia de conferência: ciclo é informado, nunca inferido pela API; não grava nem homologa o fornecedor. */
export function reconcileKoreCycle(snapshot, period, file) {
  if (!snapshot?.complete || !Array.isArray(snapshot.rows)) throw Error('Conclua a coleta KORE.');
  if (!validISODate(period.start) || !validISODate(period.end) || period.start > period.end)
    throw Error('Informe início/fim para comparar o mesmo ciclo.');
  if (!file || file.origin === 'kore-api')
    throw Error('Selecione um extrato CSV independente da API.');
  const statement = importLineStatement(file.text, file.filename, file.id);
  if (statement.operator !== 'Kore') throw Error('O arquivo de conferência precisa ser KORE.');
  const rows = statement.rows.filter(
    (row) => row.service === 'dados' && row.start === period.start && row.end === period.end,
  );
  if (!rows.length) throw Error('O CSV não contém apuração com as duas datas exatas informadas.');
  const indexes = [new Map(), new Map()];
  for (const [i, list] of [snapshot.rows, rows].entries())
    for (const row of list) {
      const key = row.iccid || `sem-iccid:${i}:${row.id}`;
      if (!indexes[i].has(key)) indexes[i].set(key, []);
      indexes[i].get(key).push(row);
    }
  const details = [...new Set([...indexes[0].keys(), ...indexes[1].keys()])].map((iccid) => {
    const a = indexes[0].get(iccid) || [],
      b = indexes[1].get(iccid) || [],
      api = a[0],
      csv = b[0];
    const apiTicks = api?.bytes == null ? null : api.bytes * 1024;
    let state;
    if (a.length > 1 || b.length > 1) state = 'ICCID ambíguo';
    else if (!a.length) state = 'Somente CSV';
    else if (!b.length) state = 'Somente API';
    else if (!api.number || api.number !== csv.number) state = 'MSISDN divergente ou ausente';
    else if (
      !Number.isSafeInteger(api.bytes) ||
      !Number.isSafeInteger(apiTicks) ||
      apiTicks < 0 ||
      !consumptionEligible(csv)
    )
      state = 'Consumo para revisão';
    else state = apiTicks === csv.ticks ? 'Volumes iguais' : 'Volumes diferentes';
    const comparable = ['Volumes iguais', 'Volumes diferentes'].includes(state);
    return {
      iccid: api?.iccid || csv?.iccid || '',
      numberApi: api?.number || '',
      numberCsv: csv?.number || '',
      state,
      apiTicks: Number.isSafeInteger(apiTicks) ? apiTicks : null,
      csvTicks: csv?.ticks ?? null,
      difference: comparable ? apiTicks - csv.ticks : null,
      sourceRow: csv?.sourceRow ?? null,
    };
  });
  const compared = details.filter((r) => r.difference != null);
  return {
    details,
    compared: compared.length,
    equal: details.filter((r) => r.state === 'Volumes iguais').length,
    totalApi: compared.length ? exactSum(compared.map((r) => r.apiTicks)) : null,
    totalCsv: compared.length ? exactSum(compared.map((r) => r.csvTicks)) : null,
    readAt: snapshot.readAt,
    firstReadAt: snapshot.firstReadAt || snapshot.readAt,
    filename: file.filename,
    period: { ...period },
    status: period.confirmed
      ? 'Ciclo declarado como confirmado pelo usuário'
      : 'Prévia; ciclo ainda não confirmado pela operadora',
  };
}
