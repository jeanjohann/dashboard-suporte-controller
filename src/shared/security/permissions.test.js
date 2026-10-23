/**
 * Testes de regressão: Controle compartilhado de páginas e ações. A produção exige identidade validada; as planilhas continuam locais.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { allowsPage, allowsSource, allowsAction, validateUser } from './permissions.js';
const user = { role: 'user', active: true, pages: ['orders'], canImport: true, canExport: false };
test('permissões recusam páginas, ações e bases não concedidas', () => {
  assert.equal(allowsPage(user, 'orders'), true);
  assert.equal(allowsPage(user, 'users'), false);
  assert.equal(allowsPage(user, 'lines'), false);
  assert.equal(allowsPage(user, 'monitoring'), false);
  assert.equal(allowsPage({ ...user, pages: ['monitoring'] }, 'monitoring'), true);
  assert.equal(allowsSource({ ...user, pages: ['monitoring'] }, 'orders'), false);
  assert.equal(allowsPage(user, 'imports'), true);
  assert.equal(allowsSource(user, 'operational'), false);
  assert.equal(allowsSource(user, 'orders'), true);
  assert.equal(allowsAction(user, 'export'), false);
  assert.equal(allowsPage({ ...user, active: false }, 'orders'), false);
  assert.equal(allowsSource({ ...user, pages: ['operational-analysis'] }, 'operational'), true);
  assert.equal(allowsSource(user, 'logistics'), false);
  assert.equal(allowsSource({ ...user, pages: ['operational'] }, 'logistics'), false);
  assert.equal(allowsSource({ ...user, pages: ['operational-analysis'] }, 'logistics'), true);
  assert.equal(
    allowsSource({ ...user, pages: ['operational-analysis'], canImport: false }, 'logistics'),
    false,
  );
});
test('cadastro normaliza endereço, rejeita páginas desconhecidas e não aceita dados de planilhas', () => {
  const input = { ...user, email: ' USER@COMPANY.COM ', version: 0 };
  assert.equal(validateUser(input).email, 'user@company.com');
  assert.throws(() => validateUser({ ...input, pages: ['unknown'] }));
  assert.throws(() => validateUser({ ...input, records: [] }));
  assert.throws(() => validateUser({ ...input, active: 'true' }));
  assert.throws(() => validateUser({ ...input, pages: ['orders', 'orders'] }));
});
test('Meu Dashboard tem controle próprio sem conceder bases e preserva usuários legados', () => {
  assert.equal(allowsPage(user, 'my-dashboard'), true);
  assert.equal(allowsPage({ ...user, canDashboard: false }, 'my-dashboard'), false);
  const dashboardOnly = { ...user, pages: [], canDashboard: true };
  assert.equal(allowsPage(dashboardOnly, 'my-dashboard'), true);
  assert.equal(allowsPage(dashboardOnly, 'orders'), false);
  assert.equal(allowsSource(dashboardOnly, 'orders'), false);
  assert.equal(allowsPage({ ...dashboardOnly, active: false }, 'my-dashboard'), false);
  assert.throws(() =>
    validateUser({ ...user, email: 'a@example.invalid', version: 0, canDashboard: 'sim' }),
  );
});
