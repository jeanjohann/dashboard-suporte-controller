import test from 'node:test';
import assert from 'node:assert/strict';
import { readSourceResponse } from './sourceDownloadClient.js';
test('decodificação suporta rede dividindo caracteres UTF-8 e recusa metadados de outra versão', async () => {
  const text = '{"valor":"á😀00144"}',
    encoded = new TextEncoder().encode(text),
    head = { snapshotId: 'a'.repeat(64), hash: 'b'.repeat(64), bytes: encoded.length };
  const headers = {
    'Content-Type': 'application/json',
    'X-Snapshot-Id': head.snapshotId,
    'X-Snapshot-SHA256': head.hash,
    'X-Snapshot-Bytes': String(head.bytes),
  };
  const body = new ReadableStream({
    start(controller) {
      for (const byte of encoded) controller.enqueue(Uint8Array.of(byte));
      controller.close();
    },
  });
  assert.equal(await readSourceResponse(new Response(body, { headers }), head), text);
  let cancelled = false;
  const wrong = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  await assert.rejects(
    readSourceResponse(
      new Response(wrong, { headers: { ...headers, 'X-Snapshot-Id': 'c'.repeat(64) } }),
      head,
    ),
    /versão solicitada/,
  );
  assert.equal(cancelled, true);
});
