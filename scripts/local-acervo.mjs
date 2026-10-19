/** Laboratório local de leitura: fontes explícitas, sem escrita e mesmas regras do painel. */
import { readFile, stat, realpath } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { importWorkbook } from '../src/modules/orders/data/import.js';
import { importOperational } from '../src/modules/operational/domain/operational.js';
import { importLogistics } from '../src/modules/logistics/domain/logistics.js';
import { field, attendanceDate, applyFilters } from '../src/shared/data/filters.js';
import { periodMetrics } from '../src/modules/orders/domain/dashboard.js';

export const archiveRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../import');
const realSources = [
  ['orders', 'Ordens de Serviços 2025_26.xlsx', importWorkbook],
  ['operational', 'Operacional 08-05-2026.xlsx', importOperational],
  ['logistics', 'Envios_Recebimentos.xlsx', importLogistics],
];
const demoSources = [
  ['orders', 'DEMO-Ordens-de-Servico-1000.xlsx', importWorkbook],
  ['operational', 'DEMO-Operacional-1000.xlsx', importOperational],
];

/** Perfil local explícito; nenhum caminho ou nome de arquivo vem da pergunta do agente. */
export async function archiveProfile() {
  try {
    const config = JSON.parse(
      await readFile(resolve(archiveRoot, 'assistant-source.json'), 'utf8'),
    );
    if (!['real', 'demo'].includes(config.profile)) throw new Error('Perfil inválido.');
    return config.profile;
  } catch (error) {
    if (error.code === 'ENOENT') return 'real';
    throw error;
  }
}

/** O mês de referência vem dos realizados, nunca de agendamentos futuros. */
export function attendanceQuery(data) {
  for (const label of ['Status', 'Motivo', 'Data de atendimento']) {
    if (!data.columns.some((column) => column.label === label))
      throw new Error(`Coluna obrigatória ausente: ${label}`);
  }
  const completed = data.rows.filter((row) =>
    ['Concluída', 'Pago'].includes(field(data, row, 'Status')?.raw),
  );
  const dates = completed
    .map((row) => attendanceDate(data, row))
    .filter(Boolean)
    .sort();
  if (!dates.length) throw new Error('Não há realizados com data válida para definir o mês.');
  const latest = dates.at(-1);
  const start = `${latest.slice(0, 7)}-01`;
  const end = new Date(Date.UTC(Number(latest.slice(0, 4)), Number(latest.slice(5, 7)), 0))
    .toISOString()
    .slice(0, 10);
  const selection = applyFilters(data, { start, end });
  const metrics = periodMetrics(selection);
  return {
    question: 'Volume de atendimentos no último mês disponível com realizados',
    period: { start, end, latestCompletedDate: latest, completeCalendarMonth: false },
    metrics: {
      completed: metrics.completed,
      productive: metrics.productive,
      unproductive: metrics.unproductive,
      distinctCompletedCalls: metrics.calls,
    },
    evidence: selection.rows
      .filter((row) => ['Concluída', 'Pago'].includes(field(data, row, 'Status')?.raw))
      .map((row) => ({ row: row.sourceRow, call: row.os })),
    completedWithoutValidDate: completed.length - dates.length,
    criteria: [
      'Realizados: Status Concluída ou Pago; data: Data de atendimento.',
      'Efetivos excluem Motivo Visita Improdutiva; custos não são alterados.',
      'Chamados distintos entre realizados; duas linhas da mesma OS não são dois chamados.',
      'O último mês pode estar incompleto. Ausência de data não é contada como zero.',
    ],
  };
}

/** Fontes fixas por perfil. Dados detalhados ficam apenas no contexto local quando solicitados. */
export async function readArchive({ profile, includeData = false } = {}) {
  profile ??= await archiveProfile();
  if (!['real', 'demo'].includes(profile)) throw new Error('Perfil de acervo inválido.');
  const root = await realpath(archiveRoot);
  const manifest = [];
  const datasets = {};
  let orders;
  for (const [kind, filename, parse] of profile === 'demo' ? demoSources : realSources) {
    const path = await realpath(resolve(root, filename));
    if (!path.startsWith(root + sep)) throw new Error('Fonte fora da pasta autorizada.');
    const before = await stat(path);
    const bytes = await readFile(path);
    const after = await stat(path);
    if (before.mtimeMs !== after.mtimeMs || before.size !== after.size)
      throw new Error('Uma fonte mudou durante a leitura. Tente novamente.');
    const parsed = parse(bytes);
    if (kind === 'orders') orders = parsed;
    if (includeData) datasets[kind] = parsed;
    manifest.push({
      kind,
      filename,
      modifiedAt: after.mtime.toISOString(),
      sha256: createHash('sha256').update(bytes).digest('hex'),
      sheets: parsed.sheetName
        ? [parsed.sheetName]
        : kind === 'operational'
          ? ['Equipamentos']
          : parsed.sheets?.map((sheet) => sheet.name),
      records: parsed.rows.length,
      issues: parsed.issues?.length ?? null,
      skipped: parsed.skipped ?? null,
    });
  }
  return {
    profile,
    generatedAt: new Date().toISOString(),
    manifest,
    attendance: attendanceQuery(orders),
    ...(includeData ? { datasets } : {}),
  };
}

/** Contrato mínimo: sem linhas, chamados, clientes, placas, CNPJs ou identificadores de equipamentos. */
export function assistantPayload(archive) {
  const { period, metrics, criteria, completedWithoutValidDate } = archive.attendance;
  const source = archive.manifest.find((item) => item.kind === 'orders');
  return {
    profile: archive.profile,
    period,
    metrics,
    criteria,
    completedWithoutValidDate,
    generatedAt: archive.generatedAt,
    source: {
      filename: source.filename,
      sheets: source.sheets,
      modifiedAt: source.modifiedAt,
      sha256: source.sha256,
      issues: source.issues,
      skipped: source.skipped,
    },
  };
}

/** Interface restrita ao computador; token fica na configuração local, nunca no repositório. */
export function archiveServer(token) {
  if (!token || token.length < 32)
    throw new Error('Defina ACERVO_LOCAL_TOKEN com pelo menos 32 caracteres.');
  return createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    const supplied = Buffer.from(String(request.headers['x-acervo-token'] ?? ''));
    const expected = Buffer.from(token);
    if (
      request.headers.origin ||
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      response.writeHead(403).end(JSON.stringify({ error: 'Acesso negado.' }));
      return;
    }
    if (
      request.method !== 'GET' ||
      !['/v1/acervo/atendimentos', '/v1/acervo/assistant-payload'].includes(request.url)
    ) {
      response.writeHead(404).end(JSON.stringify({ error: 'Consulta não disponível.' }));
      return;
    }
    try {
      const archive = await readArchive();
      response.end(
        JSON.stringify(
          request.url.endsWith('assistant-payload') ? assistantPayload(archive) : archive,
        ),
      );
    } catch {
      response.writeHead(503).end(
        JSON.stringify({
          error:
            'Acervo indisponível ou incompatível. Confira os arquivos e execute a validação local.',
        }),
      );
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--serve')) {
    archiveServer(process.env.ACERVO_LOCAL_TOKEN).listen(5680, '127.0.0.1', () =>
      console.log('Acervo local disponível em 127.0.0.1:5680.'),
    );
  } else {
    console.log(JSON.stringify(await readArchive(), null, 2));
  }
}
