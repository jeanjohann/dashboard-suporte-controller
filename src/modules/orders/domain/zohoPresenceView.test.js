import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeZohoPresence } from './zohoPresence.js';
import { zohoPresenceView, presenceDateTime } from './zohoPresenceView.js';
const report = (values, options = {}) =>
  analyzeZohoPresence(
    values.map((cells, i) => ({ sourceRow: i + 2, cells })),
    { agent: 0, start: 1, end: 2 },
    { offset: '-03:00', ...options },
  );
test('evolução diária recorta meia-noite no fuso do arquivo e une sobreposições antes de somar', () => {
  const data = report([
      ['A', '21/10/2026 23:00', '22/10/2026 02:00'],
      ['A', '22/10/2026 01:00', '22/10/2026 03:00'],
      ['B', '22/10/2026 00:00', '22/10/2026 02:00'],
    ]),
    original = JSON.stringify(data),
    view = zohoPresenceView(data);
  assert.deepEqual(view.daily, [
    { date: '2026-10-21', seconds: 3600 },
    { date: '2026-10-22', seconds: 18000 },
  ]);
  assert.equal(
    view.daily.reduce((n, row) => n + row.seconds, 0),
    data.totalSeconds,
  );
  assert.equal(JSON.stringify(data), original);
  assert.equal(
    presenceDateTime(Date.parse('2026-10-22T02:00:00Z'), '-03:00'),
    '2026-10-21 23:00:00',
  );
});
test('filtro por agente mantém apenas suas sessões e apontamentos, sem converter ausências em zero', () => {
  const data = report([
      ['A', '21/10/2026 08:00', '21/10/2026 10:00'],
      ['A', '21/10/2026 11:00', ''],
      ['B', '22/10/2026 08:00', '22/10/2026 12:00'],
    ]),
    view = zohoPresenceView(data, 'A');
  assert.equal(view.totalSeconds, 7200);
  assert.equal(view.issues.length, 1);
  assert.equal(view.sessions.length, 1);
  assert.deepEqual(view.daily, [{ date: '2026-10-21', seconds: 7200 }]);
  assert.equal(zohoPresenceView(data, 'ausente').groups.length, 0);
});
test('fim à meia-noite não cria dia vazio e períodos extensos não geram milhões de pontos', () => {
  const view = zohoPresenceView(report([['A', '21/10/2026 23:00', '22/10/2026 00:00']]));
  assert.deepEqual(view.daily, [{ date: '2026-10-21', seconds: 3600 }]);
  const long = zohoPresenceView(report([['A', '21/10/2020 00:00', '22/10/2026 00:00']]));
  assert.equal(long.dailyLimited, true);
  assert.equal(long.daily.length, 0);
  assert.ok(long.totalSeconds > 0);
});
test('recorte diário mantém duração zero válida e período limitado do relatório', () => {
  const view = zohoPresenceView(
    report(
      [
        ['A', '21/10/2026 00:00', '21/10/2026 00:00'],
        ['B', '20/10/2026 23:00', '22/10/2026 01:00'],
      ],
      { start: '2026-10-21', end: '2026-10-21' },
    ),
  );
  assert.equal(view.groups.length, 2);
  assert.equal(view.totalSeconds, 86400);
  assert.deepEqual(view.daily, [{ date: '2026-10-21', seconds: 86400 }]);
});
