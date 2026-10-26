import React, { useEffect, useRef, useState } from 'react';
import { agents, manualFields, blankEntry, validateEntry, entryId } from '../domain/indicators.js';
export function ManualIndicatorForm({
  records,
  period,
  busy,
  ready,
  save,
  remove,
  today,
  onDirty,
}) {
  const formDetails = useRef(null);
  const [date, setDate] = useState(
      period.end < today ? period.end : period.start > today ? period.start : today,
    ),
    [agentId, setAgent] = useState(agents[0].id),
    [editing, setEditing] = useState(null),
    [message, setMessage] = useState('');
  const stored = records.find((r) => r.id === `${date}.${agentId}`),
    draft = editing?.value || (!stored?.deleted && stored?.value) || blankEntry(date, agentId),
    revision = editing?.revision ?? stored?.revision ?? 0;
  useEffect(() => {
    onDirty?.(Boolean(editing));
    return () => onDirty?.(false);
  }, [editing, onDirty]);
  function select(action) {
    if (editing && !window.confirm('Descartar as alterações ainda não salvas deste lançamento?'))
      return;
    setEditing(null);
    setMessage('');
    action();
  }
  function update(next) {
    setEditing({ value: next, revision });
    setMessage('');
  }
  async function submit(e) {
    e.preventDefault();
    try {
      validateEntry(draft);
      await save(draft, revision);
      setEditing(null);
      setMessage('Lançamento confirmado no banco.');
    } catch (e) {
      setMessage(e.message);
    }
  }
  function editRecord(record) {
    select(() => {
      setDate(record.value.date);
      setAgent(record.value.agentId);
      formDetails.current.open = true;
      formDetails.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }
  async function deleteRecord(record) {
    const name = agents.find((agent) => agent.id === record.value.agentId)?.name;
    if (
      !window.confirm(
        `Excluir o lançamento de ${name} em ${record.value.date.split('-').reverse().join('/')}? Todas as quantidades, atividades e observações desse registro diário serão removidas. Para corrigir apenas um campo, use Editar.${editing ? ' As alterações ainda não salvas no formulário também serão descartadas.' : ''}`,
      )
    )
      return;
    try {
      await remove(record.id, record.revision);
      setEditing(null);
      setMessage('Lançamento excluído. Os indicadores foram atualizados.');
    } catch (error) {
      setMessage(error.message);
    }
  }
  const inside = date >= period.start && date <= period.end;
  return (
    <div className="si-manual-management">
      <div className="si-manual-records">
        <p>
          <strong>Lançamentos salvos no período</strong>
        </p>
        <p className="scope">
          Edite as quantidades ou exclua o registro diário completo. Para retirar só um equipamento,
          edite o campo e deixe-o vazio.
        </p>
        {records.some((record) => !record.deleted) ? (
          <div className="si-manual-records-scroll">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Agente</th>
                  <th>Quantidades informadas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .filter((record) => !record.deleted)
                  .map((record) => (
                    <tr key={record.id}>
                      <td>{record.value.date.split('-').reverse().join('/')}</td>
                      <td>{agents.find((agent) => agent.id === record.value.agentId)?.name}</td>
                      <td>
                        {manualFields
                          .filter(([key]) => record.value.values[key] !== null)
                          .map(([key, label]) => `${label}: ${record.value.values[key]}`)
                          .join(' · ') || 'Somente observações'}
                      </td>
                      <td>
                        <div className="si-toolbar">
                          <button
                            type="button"
                            disabled={busy || !ready}
                            onClick={() => editRecord(record)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            disabled={busy || !ready}
                            onClick={() => deleteRecord(record)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="scope">
            {ready
              ? 'Nenhum lançamento salvo neste período.'
              : 'Aguardando leitura dos lançamentos.'}
          </p>
        )}
      </div>
      <details className="si-manual-form" ref={formDetails}>
        <summary>Adicionar ou editar lançamento manual</summary>
        <form onSubmit={submit}>
          <div className="si-toolbar">
            <label>
              Data do registro
              <input
                type="date"
                value={date}
                min={period.start}
                max={period.end}
                disabled={busy}
                onChange={(e) => select(() => setDate(e.target.value))}
              />
            </label>
            <label>
              Agente
              <select
                value={agentId}
                disabled={busy}
                onChange={(e) => select(() => setAgent(e.target.value))}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <small>
              {stored && !stored.deleted
                ? 'Editando o registro salvo · revisão ' + stored.revision
                : 'Novo registro diário'}
            </small>
          </div>
          <p className="scope">
            Informe as quantidades ocorridas nesta data. Vazio significa não informado; zero é uma
            quantidade confirmada. Assuntos contam chamados atendidos por categoria e não devem ser
            somados aos chamados criados ou fechados.
          </p>
          {!inside && <p role="alert">Selecione uma data dentro do período atual.</p>}
          <fieldset disabled={busy || !ready || !inside}>
            <legend>Chamados abertos pelo próprio suporte e assuntos · manual</legend>
            <div className="si-input-grid">
              {manualFields.slice(0, 10).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type="number"
                    min="0"
                    max="1000000"
                    step="1"
                    value={draft.values[key] ?? ''}
                    onChange={(e) =>
                      update({
                        ...draft,
                        values: {
                          ...draft.values,
                          [key]: e.target.value === '' ? null : Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={busy || !ready || !inside}>
            <legend>Equipamentos e atividades · manual</legend>
            <div className="si-input-grid">
              {manualFields.slice(10).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type="number"
                    min="0"
                    max="1000000"
                    step="1"
                    value={draft.values[key] ?? ''}
                    onChange={(e) =>
                      update({
                        ...draft,
                        values: {
                          ...draft.values,
                          [key]: e.target.value === '' ? null : Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <div className="si-input-grid">
              <label>
                Atividades e observações
                <textarea
                  maxLength={2000}
                  value={draft.note}
                  onChange={(e) => update({ ...draft, note: e.target.value })}
                />
              </label>
              <label>
                Algo novo? Explique
                <textarea
                  maxLength={2000}
                  value={draft.novelty}
                  onChange={(e) => update({ ...draft, novelty: e.target.value })}
                />
              </label>
            </div>
          </fieldset>
          <div className="si-toolbar">
            <button className="si-primary" disabled={busy || !ready || !inside}>
              {busy
                ? 'Processando…'
                : stored && !stored.deleted
                  ? 'Salvar alterações'
                  : 'Salvar lançamento'}
            </button>
            {editing && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditing(null);
                  setMessage('');
                }}
              >
                Descartar edição
              </button>
            )}
          </div>
          <small>
            Identificação: {entryId(draft)}. Salvar novamente atualiza este registro; não acrescenta
            outra contagem.
          </small>
        </form>
      </details>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
