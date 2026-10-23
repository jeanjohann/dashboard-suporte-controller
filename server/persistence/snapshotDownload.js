/** Uma resposta por base, lida em lotes internos; nunca monta o JSON inteiro na memória do Worker. */
export function snapshotDownload(request, store, manifest) {
  let index = 0,
    bytes = 0,
    cancelled = false;
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async pull(controller) {
      if (cancelled) return;
      try {
        if (request.signal.aborted) throw Error('Consulta cancelada.');
        const rows = await store.rows(
          'SELECT part_index,payload_text FROM business_snapshot_parts WHERE snapshot_id=? AND part_index>=? ORDER BY part_index LIMIT 32',
          manifest.id,
          index,
        );
        if (cancelled) return;
        if (!rows.length) throw Error('Parte ausente.');
        for (const row of rows) {
          if (
            row.part_index !== index ||
            index >= manifest.part_count ||
            typeof row.payload_text !== 'string'
          )
            throw Error('Sequência inválida.');
          const chunk = encoder.encode(row.payload_text);
          bytes += chunk.byteLength;
          if (bytes > manifest.byte_count) throw Error('Tamanho divergente.');
          controller.enqueue(chunk);
          index++;
        }
        if (index === manifest.part_count) {
          if (bytes !== manifest.byte_count) throw Error('Base incompleta.');
          controller.close();
        }
      } catch {
        cancelled = true;
        controller.error(new Error('Não foi possível concluir a base salva.'));
      }
    },
    cancel() {
      cancelled = true;
    },
  });
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Snapshot-Id': manifest.id,
      'X-Snapshot-SHA256': manifest.payload_hash,
      'X-Snapshot-Bytes': String(manifest.byte_count),
      Vary: 'Accept-Encoding',
    },
  });
}
