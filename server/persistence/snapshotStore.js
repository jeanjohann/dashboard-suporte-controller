/** Partes imutáveis, integridade por hash e publicação de ponteiros em transação D1. */
import {
  snapshotKinds,
  snapshotMaxBytes,
  snapshotMaxParts,
  sha256,
  validateSnapshotValue,
  prepareSnapshot,
} from '../../src/shared/persistence/snapshotPayload.js';
export class SnapshotConflict extends Error {
  constructor() {
    super('A base foi alterada em outro computador. Recarregue antes de salvar.');
    this.code = 'CONFLICT';
  }
}
export function createSnapshotStore(db, { actor, now = () => new Date().toISOString() } = {}) {
  if (!db?.prepare || typeof actor !== 'string') throw Error('Banco de bases não configurado.');
  const statement = (sql, ...args) => db.prepare(sql).bind(...args);
  async function rows(sql, ...args) {
    const r = await statement(sql, ...args).all();
    if (r.success === false || !Array.isArray(r.results)) throw Error('Leitura não confirmada.');
    return r.results;
  }
  async function manifest(id) {
    return statement('SELECT * FROM business_snapshots WHERE id = ?', id).first();
  }
  async function head(kind) {
    return statement(
      'SELECT h.*, s.filename,s.row_count,s.byte_count,s.created_at,s.payload_hash,s.part_count FROM business_snapshot_heads h JOIN business_snapshots s ON s.id=h.snapshot_id WHERE h.kind=? AND s.state = ?',
      kind,
      'complete',
    ).first();
  }
  async function start(meta) {
    if (
      !snapshotKinds.includes(meta.kind) ||
      !/^([a-f0-9]{64})$/.test(meta.id) ||
      !/^[a-f0-9]{64}$/.test(meta.hash) ||
      meta.id !== (await sha256(meta.kind + '\n' + meta.hash)) ||
      !Number.isSafeInteger(meta.bytes) ||
      meta.bytes < 1 ||
      meta.bytes > snapshotMaxBytes ||
      !Number.isInteger(meta.partCount) ||
      meta.partCount < 1 ||
      meta.partCount > snapshotMaxParts ||
      typeof meta.filename !== 'string' ||
      meta.filename.length > 500
    )
      throw Error('Manifesto inválido.');
    await statement(
      "INSERT INTO business_snapshots (id,kind,payload_hash,part_count,byte_count,state,filename,created_at,created_by) VALUES (?,?,?,?,?,'uploading',?,?,?) ON CONFLICT(id) DO NOTHING",
      meta.id,
      meta.kind,
      meta.hash,
      meta.partCount,
      meta.bytes,
      meta.filename,
      now(),
      actor,
    ).run();
    const saved = await manifest(meta.id);
    if (
      !saved ||
      saved.kind !== meta.kind ||
      saved.payload_hash !== meta.hash ||
      saved.part_count !== meta.partCount ||
      saved.byte_count !== meta.bytes ||
      saved.filename !== meta.filename
    )
      throw Error('Manifesto divergente.');
    return saved;
  }
  async function part(id, index, text) {
    const m = await manifest(id);
    if (
      !m ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= m.part_count ||
      typeof text !== 'string' ||
      !text.length ||
      text.length > 48 * 1024 ||
      new TextEncoder().encode(text).length > 192 * 1024
    )
      throw Error('Parte inválida.');
    if (m.state === 'complete') return;
    await statement(
      'INSERT INTO business_snapshot_parts(snapshot_id,part_index,payload_text) VALUES(?,?,?) ON CONFLICT(snapshot_id,part_index) DO NOTHING',
      id,
      index,
      text,
    ).run();
    const saved = await statement(
      'SELECT payload_text FROM business_snapshot_parts WHERE snapshot_id=? AND part_index=?',
      id,
      index,
    ).first();
    if (saved?.payload_text !== text) throw Error('Reenvio de parte divergente.');
  }
  async function read(id, { staging = false } = {}) {
    const m = await manifest(id);
    if (!m || (!staging && m.state !== 'complete')) throw Error('Base ainda não concluída.');
    const parts = await rows(
      'SELECT part_index,payload_text FROM business_snapshot_parts WHERE snapshot_id=? ORDER BY part_index',
      id,
    );
    if (parts.length !== m.part_count || parts.some((r, i) => r.part_index !== i))
      throw Error('Há partes ausentes.');
    const text = parts.map((r) => r.payload_text).join('');
    if (
      new TextEncoder().encode(text).length !== m.byte_count ||
      (await sha256(text)) !== m.payload_hash
    )
      throw Error('Integridade da base inválida.');
    return validateSnapshotValue(m.kind, JSON.parse(text));
  }
  async function complete(id) {
    const m = await manifest(id);
    if (!m) throw Error('Base ausente.');
    const value = await read(id, { staging: true });
    if (m.kind !== 'monitoring' && value.filename !== m.filename)
      throw Error('Nome da origem divergente do manifesto.');
    await statement(
      "UPDATE business_snapshots SET state='complete', row_count=?,completed_at=? WHERE id=? AND state='uploading'",
      value.vehicles?.length ?? value.data.rows.length,
      now(),
      id,
    ).run();
    return manifest(id);
  }
  async function stage(kind, value) {
    const p = await prepareSnapshot(kind, value),
      m = await start({ ...p, partCount: p.parts.length });
    if (m.state !== 'complete') {
      let group = [],
        bytes = 0;
      const flush = async () => {
        if (!group.length) return;
        await statement(
          "INSERT INTO business_snapshot_parts(snapshot_id,part_index,payload_text) SELECT ?, json_extract(value,'$.index'),json_extract(value,'$.text') FROM json_each(?) WHERE 1 ON CONFLICT(snapshot_id,part_index) DO NOTHING",
          p.id,
          JSON.stringify(group),
        ).run();
        group = [];
        bytes = 0;
      };
      for (let index = 0; index < p.parts.length; index++) {
        const item = { index, text: p.parts[index] },
          size = new TextEncoder().encode(JSON.stringify(item)).length;
        if (bytes + size > 900 * 1024) await flush();
        group.push(item);
        bytes += size + 1;
      }
      await flush();
      await complete(p.id);
    }
    return p.id;
  }
  async function publish(id, selection, extra = [], guard = null) {
    if (
      !/^[a-zA-Z0-9_-]{1,100}$/.test(id) ||
      !Array.isArray(selection) ||
      !selection.length ||
      selection.length > 3 ||
      new Set(selection.map((s) => s.kind)).size !== selection.length ||
      selection.some(
        (s) =>
          !snapshotKinds.includes(s.kind) ||
          !/^[a-f0-9]{64}$/.test(s.snapshotId) ||
          !Number.isSafeInteger(s.expectedRevision) ||
          s.expectedRevision < 0,
      )
    )
      throw Error('Publicação inválida.');
    const signature = JSON.stringify(selection),
      prior = await statement(
        'SELECT selection_json FROM business_publications WHERE id=?',
        id,
      ).first();
    if (prior) {
      if (prior.selection_json !== signature) throw Error('Reenvio de publicação divergente.');
      return;
    }
    const conditions = [],
      args = [];
    for (const s of selection) {
      conditions.push(
        "COALESCE((SELECT revision FROM business_snapshot_heads WHERE kind=?),0)=? AND EXISTS(SELECT 1 FROM business_snapshots WHERE id=? AND kind=? AND state='complete')",
      );
      args.push(s.kind, s.expectedRevision, s.snapshotId, s.kind);
    }
    if (guard) {
      conditions.push(guard.sql);
      args.push(...guard.args);
    }
    const at = now();
    const batch = [
      statement(
        `INSERT INTO business_publications(id,selection_json,valid,created_at,created_by) VALUES(?,?,CASE WHEN (${conditions.join(') AND (')}) THEN 1 ELSE 0 END,?,?)`,
        id,
        signature,
        ...args,
        at,
        actor,
      ),
    ];
    for (const s of selection) {
      batch.push(
        statement(
          'UPDATE business_snapshots SET published_at=COALESCE(published_at,?) WHERE id=?',
          at,
          s.snapshotId,
        ),
      );
      batch.push(
        statement(
          'INSERT INTO business_snapshot_heads(kind,snapshot_id,revision,updated_at,updated_by) VALUES(?,?,?,?,?) ON CONFLICT(kind) DO UPDATE SET snapshot_id=excluded.snapshot_id,revision=excluded.revision,updated_at=excluded.updated_at,updated_by=excluded.updated_by',
          s.kind,
          s.snapshotId,
          s.expectedRevision + 1,
          at,
          actor,
        ),
      );
    }
    try {
      await db.batch([...batch, ...extra]);
    } catch (error) {
      if (String(error.message).includes('CHECK constraint failed')) throw new SnapshotConflict();
      throw error;
    }
  }
  async function pruneSources() {
    for (const kind of ['orders', 'operational', 'logistics'])
      await statement(
        'DELETE FROM business_snapshots WHERE kind=? AND published_at IS NOT NULL AND id NOT IN (SELECT snapshot_id FROM business_snapshot_heads) AND id NOT IN (SELECT id FROM business_snapshots WHERE kind=? AND published_at IS NOT NULL AND id NOT IN (SELECT snapshot_id FROM business_snapshot_heads) ORDER BY published_at DESC,id DESC LIMIT 4)',
        kind,
        kind,
      ).run();
  }
  return {
    statement,
    rows,
    manifest,
    head,
    start,
    part,
    read,
    complete,
    stage,
    publish,
    pruneSources,
  };
}
