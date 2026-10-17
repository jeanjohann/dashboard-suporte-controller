/** Protege a navegação consolidada: uma análise não pode desaparecer por divergência de título/categoria. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardCategories } from '../../modules/orders/config/dashboardCategories.js';
import { orderLayoutDefinitions } from '../../modules/orders/config/preferences.js';
import { allOrderStories, orderStories } from '../../modules/orders/config/reportStories.js';
import { crossAnalysisMenus } from '../../modules/operational/config/operationalMenus.js';
import { parkStories } from '../../modules/operational/config/reportStories.js';
import { consumptionCategories } from '../../modules/consumption/config/consumptionMenus.js';
import { consumptionStories } from '../../modules/consumption/config/reportStories.js';

function uniqueViews(groups) {
  const titles = groups.flatMap((group) => group.views.map((view) => view.title));
  assert.equal(new Set(titles).size, titles.length, 'Uma Section não pode ocupar dois destinos');
  assert.equal(new Set(groups.map((group) => group.id)).size, groups.length);
}

test('OS consolida sete categorias sem perder as definições individuais dos relatórios agrupados', () => {
  assert.equal(dashboardCategories.length, 7);
  assert.equal(
    dashboardCategories
      .find((category) => category.key === 'operations')
      .sections.includes('geography'),
    true,
  );
  assert.equal(
    dashboardCategories.find((category) => category.key === 'reports').sections.includes('records'),
    true,
  );
  assert.equal(
    dashboardCategories.some((category) => category.sections.includes('parkLinks')),
    false,
  );
  uniqueViews(allOrderStories);
  for (const [key, groups] of Object.entries(orderStories)) {
    const category = dashboardCategories.find((item) => item.key === key);
    for (const view of groups.flatMap((group) => group.views)) {
      const definition = orderLayoutDefinitions.find((item) => item.title === view.title);
      assert.ok(definition, `Preferência ausente: ${view.title}`);
      assert.ok(category.sections.includes(definition.id), `Categoria incorreta: ${view.title}`);
    }
  }
});

test('Parque reúne manutenção e exportação no mesmo recorte e mantém vínculos em categoria própria', () => {
  const maintenance = crossAnalysisMenus.find((item) => item.key === 'maintenance');
  assert.equal(crossAnalysisMenus.length, 5);
  uniqueViews(parkStories);
  assert.deepEqual(
    parkStories[0].views.map((view) => view.title),
    maintenance.sections,
  );
  assert.deepEqual(crossAnalysisMenus.find((item) => item.key === 'links').sections, [
    'Vínculos com o histórico de OS',
  ]);
  assert.ok(
    crossAnalysisMenus
      .find((item) => item.key === 'overview')
      .sections.includes('Parque por cliente, modelo, plano e situação'),
  );
});

test('Consumo conserva os identificadores de fila/ranking e o histórico fora do seletor', () => {
  const [, , titles] = consumptionCategories.find(([key]) => key === 'investigation');
  uniqueViews(consumptionStories);
  const grouped = consumptionStories.flatMap((group) => group.views.map((view) => view.title));
  assert.ok(grouped.every((title) => titles.includes(title)));
  assert.ok(titles.includes('Linha do tempo de consumo'));
  assert.equal(grouped.includes('Linha do tempo de consumo'), false);
});
