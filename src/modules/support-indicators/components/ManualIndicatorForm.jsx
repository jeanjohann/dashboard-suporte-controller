import React, { useEffect, useState } from 'react';
import { agents, manualFields, blankEntry, validateEntry, entryId } from '../domain/indicators.js';
export function ManualIndicatorForm({ records, period, busy, ready, save, today, onDirty }) {
  const [date, setDate] = useState(
      period.end < today ? period.end : period.start > today ? period.start : today,
    ),
    [agentId, setAgent] = useState(agents[0].id),
    [editing, setEditing] = useState(null),
    [message, setMessage] = useState('');
  const stored = records.find((r) => r.id === `${date}.${agentId}`),
    draft = editing?.value || stored?.value || blankEntry(date, agentId),
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
  const inside = date >= period.start && date <= period.end;
  return (
    <details className="si-manual-form">
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
            {stored
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
            {busy ? 'Salvando…' : 'Salvar lançamento'}
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
        {message && <p role="status">{message}</p>}
        <small>
          Identificação: {entryId(draft)}. Salvar novamente atualiza este registro; não acrescenta
          outra contagem.
        </small>
      </form>
    </details>
  );
}
