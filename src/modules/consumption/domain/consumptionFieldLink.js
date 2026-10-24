/** Confere o vínculo atual do chip em campo; não presume titularidade histórica. */
export function attachFieldEvidence(rows, snapshot, now = Date.now()) {
  if (!snapshot || snapshot.demonstration) return rows;
  const ref = Date.parse(snapshot.referenceAt),
    collections = new Map(snapshot.collections.map((row) => [row.clientId, row]));
  const fresh = Number.isFinite(ref) && now >= ref && now - ref < 7200000;
  const ids = new Map();
  for (const row of snapshot.vehicles) {
    const key = JSON.stringify([row.clientId, row.vehicleId]);
    ids.set(key, (ids.get(key) || 0) + 1);
  }
  const vehicles = snapshot.vehicles.filter((row) => {
    const collection = collections.get(row.clientId),
      at = Date.parse(collection?.at);
    return (
      fresh &&
      collection?.ok &&
      ref >= at &&
      ref - at < 7200000 &&
      ids.get(JSON.stringify([row.clientId, row.vehicleId])) === 1
    );
  });
  const byChip = new Map(),
    byPhone = new Map();
  for (const row of vehicles)
    for (const [index, key] of [
      [byChip, 'iccid'],
      [byPhone, 'msisdn'],
    ]) {
      if (!/^\d+$/.test(row[key] || '')) continue;
      const list = index.get(row[key]) || [];
      list.push(row);
      index.set(row[key], list);
    }
  return rows.map((row) => {
    const a = byChip.get(row.iccid) || [],
      b = byPhone.get(row.number) || [];
    const apiLinkStatus = !fresh
      ? 'API antiga; atualizar antes de confirmar vínculo'
      : !byChip.size || !byPhone.size
        ? 'API sem ICCID/MSISDN suficientes'
        : a.length > 1 || b.length > 1
          ? 'API com vínculo de chip ambíguo'
          : a.length === 1 && b.length === 1 && a[0] === b[0]
            ? 'ICCID e MSISDN conferidos na API'
            : 'Chip/número sem correspondência conjunta na API';
    if (a.length !== 1 || b.length !== 1 || a[0] !== b[0])
      return { ...row, apiLinkStatus, fieldReferenceAt: snapshot.referenceAt };
    const api = a[0];
    if (row.link && String(row.link.serial) !== String(api.trackerId))
      return {
        ...row,
        apiLinkStatus: 'API e Operacional apontam equipamentos diferentes',
        fieldReferenceAt: snapshot.referenceAt,
        operationalLink: row.link,
        link: null,
        client: 'Vínculo para revisão',
        serial: 'Não informado',
        model: 'Não informado',
        linkState: 'Conflito com o cadastro atual da API',
        fieldLink: api,
      };
    const link = row.link || {
      client: api.clientName || api.clientId,
      serial: api.trackerId,
      model: api.deviceModel,
      plate: api.plate,
      iccid: api.iccid,
      phone: api.msisdn,
    };
    return {
      ...row,
      link,
      client: link.client,
      serial: link.serial,
      model: api.deviceModel || row.model,
      linkState: row.link ? row.linkState : 'ICCID e número conferidos na API',
      linkSource: row.link ? 'Operacional + API' : 'API',
      apiLinkStatus,
      fieldReferenceAt: snapshot.referenceAt,
      fieldLink: api,
    };
  });
}
