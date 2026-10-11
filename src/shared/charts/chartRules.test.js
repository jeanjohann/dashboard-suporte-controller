/**
 * Testes de regressão: Critérios compartilhados de disponibilidade dos gráficos e limites de ranking.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chartAvailability } from './chartRules.js';
import { cleanPreferences, sectionLabels } from '../../modules/orders/config/preferences.js';
test('pizza exige composição aditiva, não negativa e com total positivo', () => {
  assert.ok(chartAvailability([{ value: 2 }], 'calls'));
  assert.ok(chartAvailability([{ value: -1 }, { value: 2 }], 'cost'));
  assert.ok(chartAvailability([{ value: 0 }], 'cost'));
  assert.equal(chartAvailability([{ value: 2 }, { value: 3 }], 'attendances'), null);
});
test('seções começam visíveis e preferências desconhecidas não afetam o layout', () => {
  const defaults = cleanPreferences(null);
  assert.equal(Object.keys(defaults).length, Object.keys(sectionLabels).length);
  assert.ok(Object.values(defaults).every(Boolean));
  const custom = cleanPreferences({ history: false, unknown: false });
  assert.equal(custom.history, false);
  assert.equal(custom.report, true);
  assert.equal(custom.unknown, undefined);
});
