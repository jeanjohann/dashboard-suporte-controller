import React, { useState } from 'react';
import { sections, metricLabels, validateSettings } from '../domain/indicators.js';
export function IndicatorSettings({ settings, revision, ready, busy, save }) {
  const [draft, setDraft] = useState(null),
    [draftRevision, setDraftRevision] = useState(null),
    [message, setMessage] = useState('');
  const current = draft || settings;
  function edit(value) {
    if (!draft) setDraftRevision(revision);
    setDraft(value);
    setMessage('');
  }
  const toggle = (group, key) =>
    edit({
      ...current,
      [group]: current[group].includes(key)
        ? current[group].filter((k) => k !== key)
        : [...current[group], key],
    });
  function move(index, delta) {
    const next = [...current.sections];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    edit({ ...current, sections: next });
  }
  async function submit(e) {
    e.preventDefault();
    try {
      validateSettings(current);
      await save(current, draftRevision ?? revision, true);
      setDraft(null);
      setDraftRevision(null);
      setMessage('Configuração salva.');
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <details className="si-settings">
      <summary>Configurar indicadores e seções</summary>
      <form onSubmit={submit}>
        <fieldset disabled={busy || !ready}>
          <legend>Cards do resumo</legend>
          <div className="si-check-grid">
            {Object.entries(metricLabels).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={current.cards.includes(key)}
                  onChange={() => toggle('cards', key)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={busy || !ready}>
          <legend>Seções exibidas</legend>
          <div className="si-check-grid">
            {Object.entries(sections).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={current.sections.includes(key)}
                  onChange={() => toggle('sections', key)}
                />
                {label}
              </label>
            ))}
          </div>
          <ol>
            {current.sections.map((key, i) => (
              <li key={key}>
                <span>{sections[key]}</span>
                <button
                  type="button"
                  aria-label={`Mover ${sections[key]} para cima`}
                  disabled={!i}
                  onClick={() => move(i, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Mover ${sections[key]} para baixo`}
                  disabled={i === current.sections.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ↓
                </button>
              </li>
            ))}
          </ol>
        </fieldset>
        <fieldset disabled={busy || !ready}>
          <legend>Metas semanais da equipe · opcionais</legend>
          <p className="scope">
            Referências para semanas completas de segunda a domingo, sem filtro de agente. Não são
            proporcionadas em outros intervalos. Tempo em minutos.
          </p>
          <div className="si-input-grid">
            {Object.entries(metricLabels)
              .filter(([key]) => key !== 'awaitingSchedule')
              .map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type="number"
                    min="0"
                    max="1000000"
                    step="1"
                    value={current.weeklyGoals[key] ?? ''}
                    onChange={(e) => {
                      const next = { ...current.weeklyGoals };
                      if (e.target.value === '') delete next[key];
                      else next[key] = Number(e.target.value);
                      edit({ ...current, weeklyGoals: next });
                    }}
                  />
                </label>
              ))}
          </div>
        </fieldset>
        <button disabled={busy || !ready || !draft}>Salvar configuração</button>
        {message && <p role="status">{message}</p>}
      </form>
    </details>
  );
}
