/**
 * Testes de regressão: Exportação local de relatórios e gráficos. As ações do aplicativo verificam a permissão antes do download.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csv, reportCsv, chartSvg } from './exports.js';
import { chartColors } from '../charts/palette.js';
import { reportPrintStyles } from './reportPrintStyles.js';
test('CSV preserva aspas e impede interpretação de fórmulas de texto', () => {
  const output = csv([['=SUM(A1)', 'A;B', '"texto"', 1.25]]);
  assert.ok(output.startsWith('\ufeff'));
  assert.ok(output.includes('"\'=SUM(A1)"'));
  assert.ok(output.includes('"A;B"'));
  assert.ok(output.includes('""texto""'));
  assert.ok(output.endsWith('1,25'));
});
test('relatório exporta moeda em reais, filtros e origem', () => {
  const output = reportCsv(
    { eligible: 2, excluded: 1, items: [{ label: 'Cliente', value: 19900, rows: [2] }] },
    {
      grouping: 'Razão Social',
      measure: 'client',
      measureLabel: 'Contratual',
      filename: 'teste.xlsx',
      filters: { UF: ['SP'] },
    },
  );
  assert.ok(output.includes('199'));
  assert.ok(output.includes('SP'));
  assert.ok(output.includes('Linhas Excel'));
  assert.ok(output.includes('não são recebimentos'));
});
test('SVG escapa texto e mantém valores visíveis sem scripts', () => {
  const output = chartSvg([{ label: 'A < B & C', value: 2 }], {
    title: 'Título',
    subtitle: 'Fonte',
    format: String,
  });
  assert.ok(output.includes('A &lt; B &amp; C'));
  assert.ok(output.includes('>2</text>'));
  assert.ok(!output.includes('<script'));
});
test('SVG acomoda nomes extensos e barras negativas sem larguras inválidas', () => {
  const output = chartSvg([{ label: 'Nome muito extenso de um cliente '.repeat(8), value: -10 }], {
    title: 'Teste',
    subtitle: 'Todos',
    format: String,
  });
  assert.ok(output.includes('dy="19"'));
  assert.ok(!/width="-/.test(output));
  assert.ok(output.includes('>-10</text>'));
});

test('SVG materializa cores do tema para continuar legível fora do sistema', () => {
  for (const color of Object.values(chartColors)) {
    const token = color.match(/--chart-[a-z]+/)[0];
    assert.ok(reportPrintStyles.includes(`${token}:#`));
  }
  const output = chartSvg([{ label: 'Equipe', value: 7, color: chartColors.purple }], {
    title: 'Teste',
    subtitle: 'Fonte',
    format: String,
  });
  assert.ok(output.includes('fill="#8b62c0"'));
  assert.ok(!output.includes('var('));
  const negative = chartSvg([{ label: 'Diferença', value: -3 }], {
    title: 'Teste',
    subtitle: 'Fonte',
    format: String,
  });
  assert.ok(negative.includes('fill="#b75470"'));
  assert.ok(negative.includes('>-3</text>'));
});
