import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canOpenAssistantPreview,
  requestsAssistantPreview,
  assistantPreviewHash,
} from './previewAccess.js';

test('laboratório exige administrador ativo e endereço explícito; permissão forjada de página não libera', () => {
  for (const user of [
    null,
    { active: false, role: 'admin' },
    { active: true, role: 'user', pages: ['assistant-lab'] },
  ]) {
    assert.equal(canOpenAssistantPreview(user), false);
    assert.equal(requestsAssistantPreview(user, assistantPreviewHash), false);
  }
  const admin = { active: true, role: 'admin' };
  assert.equal(requestsAssistantPreview(admin, assistantPreviewHash), true);
  for (const hash of ['', '#outro', '#assistente-laboratorio-extra'])
    assert.equal(requestsAssistantPreview(admin, hash), false);
});
