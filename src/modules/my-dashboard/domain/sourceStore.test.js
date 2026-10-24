import test from 'node:test';
import assert from 'node:assert/strict';
import { createSourceStore } from './sourceStore.js';

test('publicação preserva a identidade das fontes independentes e não notifica valores idênticos', () => {
  const store = createSourceStore();
  let notifications = 0;
  const off = store.subscribe(() => notifications++);
  const orders = {};
  store.publish('orders', orders);
  const selected = store.getSnapshot().orders;
  store.publish('monitoring', {});
  assert.equal(store.getSnapshot().orders, selected);
  store.publish('orders', orders);
  assert.equal(notifications, 2);
  store.publish('orders', null);
  assert.equal(store.getSnapshot().orders, null);
  off();
  store.publish('orders', {});
  assert.equal(notifications, 3);
  assert.deepEqual(createSourceStore().getSnapshot(), {});
});
