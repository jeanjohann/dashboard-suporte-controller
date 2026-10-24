import React, { useMemo, useState } from 'react';
import { useAccess, PermissionButton } from '../../../shared/security/Access.jsx';
import { authorizeAction } from '../../../shared/security/accessClient.js';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { csv, download } from '../../../shared/export/exports.js';
import { localId } from '../../../shared/data/localId.js';
import {
  allowanceFromDraft,
  allowanceMB,
  sharedAllowanceReports,
  validateAllowances,
} from '../domain/sharedAllowance.js';
import { VOLUME_SCALE } from '../domain/lineConsumption.js';

const blank = (operator) => ({
  operator,
  name: '',
  start: '',
  end: '',
  capacityMB: '',
  members: '',
});
export function SharedAllowances({ archive, rows, operator, ready, busy, commit }) {
  const { user } = useAccess();
  const [draft, setDraft] = useState(() => blank(operator)),
    [editing, setEditing] = useState(null),
    [error, setError] = useState(''),
    [page, setPage] = useState(0),
    [detail, setDetail] = useState(null),
    [memberPage, setMemberPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const report = useMemo(() => {
    try {
      return { rows: sharedAllowanceReports(archive.allowances || [], rows) };
    } catch (e) {
      return { rows: [], error: e.message };
    }
  }, [archive.allowances, rows]);
  const shown = report.rows.filter((pool) => !operator || pool.operator === operator);
  const visible = shown.slice(page * 10, page * 10 + 10),
    selected = shown.find((p) => p.id === detail);
  const change = (key, value) => setDraft((p) => ({ ...p, [key]: value }));
  async function save(event) {
    event.preventDefault();
    if (!(await authorizeAction('import'))) return;
    try {
      const next = allowanceFromDraft({ ...draft, operator }, editing || localId());
      const allowances = validateAllowances([
        ...(archive.allowances || []).filter((p) => p.id !== next.id),
        next,
      ]);
      await commit({ ...archive, allowances }, 'Franquia compartilhada salva neste navegador.');
      setDraft(blank(operator));
      setEditing(null);
      setFormOpen(false);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }
  function edit(pool) {
    setFormOpen(true);
    setEditing(pool.id);
    setDraft({
      ...pool,
      capacityMB: (pool.capacityTicks / VOLUME_SCALE).toFixed(6).replace('.', ','),
      members: pool.members.join('\n'),
    });
  }
  async function exportReport() {
    if (!(await authorizeAction('export'))) return;
    download(
      csv([
        ['Franquias compartilhadas cadastradas; não usa filtros da grade'],
        [
          'Operadora',
          'Contrato/grupo',
          'Início',
          'Fim',
          'Franquia MB',
          'Consumo observado MB',
          'Cobertura',
          'Situação',
          'Saldo completo MB',
          'Excesso observado MB',
        ],
        ...shown.map((p) => [
          p.operator,
          p.name,
          p.start,
          p.end,
          p.capacityTicks / VOLUME_SCALE,
          p.consumedTicks == null ? '' : p.consumedTicks / VOLUME_SCALE,
          `${p.covered}/${p.members.length}`,
          p.state,
          p.balanceTicks == null ? '' : p.balanceTicks / VOLUME_SCALE,
          p.excessTicks == null ? '' : p.excessTicks / VOLUME_SCALE,
        ]),
        [],
        ['Operadora', 'Contrato/grupo', 'ICCID', 'Conferência', 'Consumo MB', 'Arquivo', 'Linha'],
        ...shown.flatMap((p) =>
          p.details.map((d) => [
            p.operator,
            p.name,
            d.iccid,
            d.state,
            d.ticks == null ? '' : d.ticks / VOLUME_SCALE,
            d.row?.filename || '',
            d.row?.sourceRow || '',
          ]),
        ),
      ]),
      'text/csv;charset=utf-8',
      'franquias-compartilhadas.csv',
    );
  }
  return (
    <section className="panel consumption-allowances">
      <h2>
        Franquia compartilhada{' '}
        <InfoNote label="Critérios da franquia compartilhada">
          Contrato/grupo, ciclo, volume e participantes são cadastrados explicitamente. Somente
          apurações de dados do mesmo ciclo e operadora, com ICCID único e consumo válido,
          participam. Ausência não vira zero. Cobertura incompleta não permite informar saldo livre
          nem garantir ausência de excedente. Saldo observado usa a apuração disponível; não é
          fechamento do ciclo. Não calcula cobrança, pró-rata ou projeção.
        </InfoNote>
      </h2>
      {(error || report.error) && (
        <p role="alert" className="notice">
          {error || report.error}
        </p>
      )}
      {!!shown.length && (
        <>
          <PermissionButton action="export" disabled={busy} onClick={exportReport}>
            Exportar grupos e conferência CSV
          </PermissionButton>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Operadora / grupo</th>
                  <th>Ciclo</th>
                  <th>Franquia MB</th>
                  <th>Observado MB</th>
                  <th>Uso observado</th>
                  <th>Cobertura</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((pool) => (
                  <tr key={pool.id}>
                    <td>
                      {pool.operator} · {pool.name}
                    </td>
                    <td>
                      {pool.start} a {pool.end}
                    </td>
                    <td>{allowanceMB(pool.capacityTicks)}</td>
                    <td>{allowanceMB(pool.consumedTicks)}</td>
                    <td>
                      {pool.percentage == null
                        ? 'Sem dados'
                        : pool.percentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) +
                          '%'}
                    </td>
                    <td>
                      {pool.covered}/{pool.members.length}
                    </td>
                    <td>
                      {pool.state}
                      {!pool.complete && pool.excessTicks > 0 ? ' · já há excesso observado' : ''}
                    </td>
                    <td>
                      {operator && (
                        <PermissionButton action="import" onClick={() => edit(pool)}>
                          Editar
                        </PermissionButton>
                      )}
                      <button
                        onClick={() => {
                          setDetail(pool.id);
                          setMemberPage(0);
                        }}
                      >
                        Conferir membros
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!!shown.length && (
        <div className="toolbar">
          <button disabled={!page} onClick={() => setPage((p) => p - 1)}>
            Grupos anteriores
          </button>
          <span>
            {page + 1} de {Math.max(1, Math.ceil(shown.length / 10))}
          </span>
          <button disabled={(page + 1) * 10 >= shown.length} onClick={() => setPage((p) => p + 1)}>
            Próximos grupos
          </button>
        </div>
      )}
      {selected && (
        <div className="consumption-pool-detail">
          <strong>{selected.name} · participantes</strong>
          <button onClick={() => setDetail(null)}>Fechar detalhe</button>
          <p className="scope">
            Saldo observado: {allowanceMB(selected.balanceTicks)} MB · Excesso observado:{' '}
            {allowanceMB(selected.excessTicks)} MB
          </p>
          <ul>
            {selected.details.slice(memberPage * 50, memberPage * 50 + 50).map((d) => (
              <li key={d.iccid}>
                {d.iccid} · {d.state} · {allowanceMB(d.ticks)} MB
              </li>
            ))}
          </ul>
          <div className="toolbar">
            <button disabled={!memberPage} onClick={() => setMemberPage((p) => p - 1)}>
              Anteriores
            </button>
            <span>
              {memberPage + 1} de {Math.ceil(selected.members.length / 50)}
            </span>
            <button
              disabled={(memberPage + 1) * 50 >= selected.members.length}
              onClick={() => setMemberPage((p) => p + 1)}
            >
              Próximos participantes
            </button>
          </div>
        </div>
      )}
      {!shown.length && (
        <p className="scope">
          Nenhuma franquia cadastrada
          {operator ? ' nesta operadora' : '. Cadastre na página KORE ou Arqia'}. Não há franquia
          presumida pelo plano.
        </p>
      )}
      {operator && (user.role === 'admin' || user.canImport) && (
        <details open={formOpen} onToggle={(event) => setFormOpen(event.currentTarget.open)}>
          <summary>
            {editing ? 'Editar contrato/grupo' : 'Cadastrar contrato/grupo e ciclo'}
          </summary>
          <form onSubmit={save} className="consumption-pool-form">
            <label>
              Contrato / grupo
              <input
                required
                maxLength={120}
                value={draft.name}
                onChange={(e) => change('name', e.target.value)}
              />
            </label>
            <label>
              Início do ciclo
              <input
                type="date"
                required
                value={draft.start}
                onChange={(e) => change('start', e.target.value)}
              />
            </label>
            <label>
              Fim do ciclo
              <input
                type="date"
                required
                value={draft.end}
                onChange={(e) => change('end', e.target.value)}
              />
            </label>
            <label>
              Franquia total · MB
              <input
                required
                inputMode="decimal"
                placeholder="Ex.: 10000 ou 10.000,5"
                value={draft.capacityMB}
                onChange={(e) => change('capacityMB', e.target.value)}
              />
            </label>
            <label className="consumption-pool-members">
              ICCIDs participantes · um por linha
              <textarea
                required
                rows={4}
                value={draft.members}
                onChange={(e) => change('members', e.target.value)}
              />
            </label>
            <p className="scope">
              Cadastro e cálculo deste navegador. Informe o grupo completo, inclusive linhas sem
              consumo. Não some contratos nem use uma amostra como se fosse o grupo inteiro.
            </p>
            <div className="toolbar">
              <PermissionButton type="submit" action="import" disabled={!ready || busy}>
                Salvar grupo
              </PermissionButton>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setDraft(blank(operator));
                  }}
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </details>
      )}
      <p className="scope">
        Independente dos filtros da grade. Usa os ciclos e os participantes cadastrados; versões
        inativas não entram. Incluído no backup da operadora.
      </p>
    </section>
  );
}
