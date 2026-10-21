import test from 'node:test';
import assert from 'node:assert/strict';
import {
  publicStudyGuide,
  privateStudyGuide,
  renderArchitectureMap,
  assertPublicArchitectureMap,
} from './presentationPrivacy.mjs';
const section =
  '## 12. Roteiro de apresentação de 10 minutos\n\nCONTEUDO_EXCLUSIVO_TESTE\n\n### Perguntas\n\nRESPOSTA_PRIVADA_TESTE\n\n';
const guide =
  '# Guia\n\n## 11. Leitura\n\nTexto público.\n\n' +
  section +
  '## 13. Como manter\n\nManutenção pública.\n';
test('remove integralmente roteiro e subseções, preservando o restante do guia', () => {
  const clean = publicStudyGuide(guide);
  assert.ok(!clean.includes('CONTEUDO_EXCLUSIVO_TESTE'));
  assert.ok(!clean.includes('RESPOSTA_PRIVADA_TESTE'));
  assert.ok(clean.includes('Texto público.'));
  assert.ok(clean.includes('Manutenção pública.'));
  assert.equal(publicStudyGuide(clean), clean);
  assert.ok(!publicStudyGuide(guide.replace(/\n/g, '\r\n')).includes('CONTEUDO_EXCLUSIVO_TESTE'));
  assert.equal(publicStudyGuide('# Guia\n' + section), '# Guia\n');
});
test('reconstrói roteiro somente na cópia local, sem duplicar ou alterar a versão pública', () => {
  const clean = publicStudyGuide(guide),
    local = privateStudyGuide(clean, section);
  assert.equal(local, guide);
  assert.equal(privateStudyGuide(local, section), guide);
  assert.equal(privateStudyGuide(clean, ''), clean);
  assert.throws(() => privateStudyGuide('# Sem âncora', section));
});
test('HTML compartilhável e inventário não carregam notas privadas; cópia local recebe conteúdo separado', () => {
  const template = '<script>const data=/*ARCHITECTURE_DATA*/ null;</script>';
  const data = { version: 'test', guide: publicStudyGuide(guide), diagrams: [] };
  const publicHtml = renderArchitectureMap(template, data),
    localHtml = renderArchitectureMap(template, {
      ...data,
      guide: privateStudyGuide(data.guide, section),
      presentationNotes: ['NOTA_EXCLUSIVA_TESTE'],
    });
  assert.ok(!publicHtml.includes('CONTEUDO_EXCLUSIVO_TESTE'));
  assert.ok(!publicHtml.includes('NOTA_EXCLUSIVA_TESTE'));
  assert.ok(localHtml.includes('CONTEUDO_EXCLUSIVO_TESTE'));
  assert.ok(localHtml.includes('NOTA_EXCLUSIVA_TESTE'));
  assert.ok(!JSON.stringify(data).includes('CONTEUDO_EXCLUSIVO_TESTE'));
  assert.doesNotThrow(() => assertPublicArchitectureMap(publicHtml));
  assert.throws(() => assertPublicArchitectureMap(localHtml));
  assert.throws(() =>
    assertPublicArchitectureMap(renderArchitectureMap(template, { ...data, guide })),
  );
  assert.throws(() => assertPublicArchitectureMap(publicHtml + '\nconst notes = [];'));
  assert.throws(() => renderArchitectureMap('<script></script>', data));
  assert.ok(!renderArchitectureMap(template, { value: '</script>' }).includes('value":"</script>'));
});
