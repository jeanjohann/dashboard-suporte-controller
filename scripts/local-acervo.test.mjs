import test from 'node:test';
import assert from 'node:assert/strict';
import { attendanceQuery, archiveServer } from './local-acervo.mjs';

test('consulta preserva chamados distintos, improdutivas e datas ausentes; ignora agendamentos futuros', () => {
  const data = {
    columns: ['Status', 'Motivo', 'Data de atendimento'].map((label) => ({ label })),
    issues: [],
    rows: [
      ['1', 'Pago', 'Revisão', 45658],
      ['1', 'Concluída', 'Visita Improdutiva', 45659],
      ['2', 'Pago', 'Revisão', null],
      ['3', 'Agendado', 'Revisão', 46000],
      ['4', 'Pago', 'Revisão', 45600],
    ].map(([os, ...values], index) => ({
      os,
      sourceRow: index + 2,
      cells: values.map((raw) => ({ raw })),
    })),
  };
  const result = attendanceQuery(data);
  assert.equal(result.period.start, '2025-01-01');
  assert.equal(result.period.end, '2025-01-31');
  assert.deepEqual(result.metrics, {
    completed: 2,
    productive: 1,
    unproductive: 1,
    distinctCompletedCalls: 1,
  });
  assert.equal(result.completedWithoutValidDate, 1);
  assert.deepEqual(
    result.evidence.map((item) => item.row),
    [2, 3],
  );
  assert.throws(() => attendanceQuery({ ...data, rows: [] }), /data válida/);
  assert.throws(() => attendanceQuery({ ...data, columns: [] }), /Coluna obrigatória/);
});

test('serviço bloqueia chamadas sem token e rotas não autorizadas', async () => {
  const token = 'a'.repeat(48);
  const server = archiveServer(token);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}/outro`;
    assert.equal((await fetch(url)).status, 403);
    assert.equal((await fetch(url, { headers: { 'x-acervo-token': token } })).status, 404);
    assert.equal(
      (await fetch(url, { headers: { 'x-acervo-token': token, Origin: 'https://example.com' } }))
        .status,
      403,
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
