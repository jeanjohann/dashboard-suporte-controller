import test from 'node:test';
import assert from 'node:assert/strict';
import {
  supportActivityExample as data,
  supportActivityPreview as calculate,
} from './supportActivityPreview.js';
test('prévia mantém autor, deduplica tickets da equipe e separa permanência e tempo apontado', () => {
  const value = calculate(data);
  assert.equal(value.totals.tickets, 2);
  assert.equal(value.totals.replies, 3);
  assert.equal(
    value.agents.reduce((sum, row) => sum + row.tickets, 0),
    3,
  );
  assert.equal(value.totals.presence, 420);
  assert.equal(value.totals.work, 90);
  assert.equal(value.totals.workTickets, 2);
  assert.equal(value.totals.average, 45);
  assert.equal(calculate(data, { agentId: 'agent-a' }).totals.average, 30);
});
test('comentários privados, pendentes, entrada e automação não contam como respostas enviadas', () => {
  const source = data.replies[0];
  const extra = [
    { visibility: 'private' },
    { state: 'pending' },
    { direction: 'in' },
    { automated: true },
  ].map((change, index) => ({ ...source, id: `excluded-${index}`, ...change }));
  assert.equal(
    calculate({ ...data, replies: [...data.replies, source, ...extra] }).totals.replies,
    3,
  );
  assert.equal(calculate({ ...data, replies: null }).totals.tickets, null);
  assert.equal(calculate(data, { start: '2026-10-01', end: '2026-10-02' }).totals.replies, 0);
});
test('sessões sobrepostas não duplicam permanência e são recortadas; apontamentos não equivalem a jornada', () => {
  const sessions = [
    { id: 'a', agentId: 'agent-a', start: '2026-10-11T23:00:00Z', end: '2026-10-12T02:00:00Z' },
    { id: 'b', agentId: 'agent-a', start: '2026-10-12T01:00:00Z', end: '2026-10-12T03:00:00Z' },
    { id: 'c', agentId: 'agent-a', start: 'bad', end: null },
  ];
  assert.equal(calculate({ ...data, sessions }).totals.presence, 180);
  assert.equal(calculate({ ...data, sessions: null }).totals.presence, null);
  assert.equal(
    calculate({
      ...data,
      entries: [
        { id: 'long', agentId: 'agent-a', ticketId: 'one', date: '2026-10-13', minutes: 1500 },
      ],
    }).totals.work,
    1500,
  );
  assert.throws(() => calculate(data, { start: '2026-02-30' }), /Período inválido/);
});
