import { field, attendanceDate } from './filters.js';

const text = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const done = (data,row) => ['Concluída','Pago'].includes(field(data,row,'Status')?.raw);
// Explicit mappings from the source workbook. Accessory installation is not a tracker installation.
export const trackerMotives = {
  installation: ['Instalação Business 2.0','Instalação Business 2.1','Instalação Start 1.0','Instalação Turbo'],
  removal: ['Desinstalação Business 2.0','Desinstalação Business 2.1','Desinstalação Start 1.0','Desinstalação Turbo']
};
export function equipment(data, selected, {requireReplacementWord = false} = {}) {
  const has = names => names.every(name => data.columns.some(col => col.label === name));
  const trackerAvailable = has(['Status','Motivo','Placa','ID Rastreador']);
  const accessoryAvailable = has(['Status','Tipo de Serviço','Motivo','Instruções']);
  const selectedRows = new Set(selected.rows.map(row => row.sourceRow));
  const issues = [], groups = new Map(), swaps = [], accessories = {Coletora:0,RFID:0}, accessoryRows={Coletora:[],RFID:[]};
  let excludedAccessories = 0, missingMonthlyDate = 0;
  const months = new Map();
  const flag = (row,label,reason) => {
    if (!selectedRows.has(row.sourceRow)) return;
    const col = data.columns.find(col => col.label === label);
    issues.push({address:`${col.letter}${row.sourceRow}`,row:row.sourceRow,column:label,value:String(field(data,row,label)?.display ?? ''),reason});
  };
  if (accessoryAvailable) for (const row of selected.rows) {
    if (!done(data,row) || field(data,row,'Tipo de Serviço')?.raw !== 'Assistência Técnica' || field(data,row,'Motivo')?.raw !== 'Manutenção de Acessório') continue;
    const instruction = text(field(data,row,'Instruções')?.raw);
    const collector = /\b(coletora|teclado|terminal de jornada)\b/.test(instruction);
    const rfid = /\brfid\b/.test(instruction);
    if (collector === rfid || (requireReplacementWord && !/\btroca\b/.test(instruction))) {
      excludedAccessories++;
      flag(row,'Instruções',collector && rfid ? 'Acessório: ambas as categorias presentes; revisar.' : !collector && !rfid ? 'Acessório: nenhuma categoria identificada; revisar.' : 'Acessório: palavra troca exigida pela opção de teste, mas ausente.');
      continue;
    }
    accessories[collector?'Coletora':'RFID']++;
    accessoryRows[collector?'Coletora':'RFID'].push(row.sourceRow);
  }
  if (trackerAvailable) for (const row of data.rows) {
    const motive = String(field(data,row,'Motivo')?.raw ?? '');
    if (/^reinstalacao\b/.test(text(motive))) { flag(row,'Motivo','Reinstalação de rastreador: revisar; não contar como troca.'); continue; }
    if (!done(data,row)) continue;
    const kind = trackerMotives.installation.includes(motive) ? 'installation' : trackerMotives.removal.includes(motive) ? 'removal' : null;
    if (!kind) continue;
    const plate = field(data,row,'Placa');
    if (!plate?.raw || plate.issue) {flag(row,'Placa','Rastreador: placa ausente/incompatível; não vincular automaticamente.');continue;}
    const key = JSON.stringify([row.os,String(plate.raw)]);
    if (!groups.has(key)) groups.set(key,{installation:[],removal:[]});
    groups.get(key)[kind].push(row);
  }
  for (const group of groups.values()) {
    if (!group.installation.length || !group.removal.length) continue;
    const rows = [...group.installation,...group.removal];
    if (group.installation.length !== 1 || group.removal.length !== 1) {rows.forEach(row=>flag(row,'Motivo','Troca de rastreador: múltiplos serviços no mesmo chamado/placa; revisar vínculo.'));continue;}
    const outgoing = group.removal[0], incoming = group.installation[0];
    const old = field(data,outgoing,'ID Rastreador'), next = field(data,incoming,'ID Rastreador');
    if (!old || !next || old.issue || next.issue || old.raw == null || next.raw == null || String(old.raw).trim()==='' || String(next.raw).trim()==='') {rows.forEach(row=>flag(row,'ID Rastreador','Troca de rastreador: serial ausente/incompatível; revisar.'));continue;}
    if (String(old.raw) === String(next.raw)) {rows.forEach(row=>flag(row,'ID Rastreador','Retirada/instalação com mesmo serial: não confirma troca; revisar.'));continue;}
    if (!rows.every(row=>selectedRows.has(row.sourceRow))) continue;
    const date = attendanceDate(data,incoming);
    swaps.push({os:incoming.os,plate:String(field(data,incoming,'Placa').raw),oldSerial:String(old.raw),newSerial:String(next.raw),removalRow:outgoing.sourceRow,installationRow:incoming.sourceRow,date});
    if (date) {const month=date.slice(0,7);months.set(month,(months.get(month)||0)+1);} else missingMonthlyDate++;
  }
  return {trackerAvailable,accessoryAvailable,swaps,accessories,accessoryRows,excludedAccessories,issues,missingMonthlyDate,months:[...months.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([label,value])=>({label,value}))};
}
