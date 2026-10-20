import React, { useContext, useEffect, useState } from 'react';
import { useAccess } from '../security/Access.jsx';
import { SavedViewsContext } from './SavedViewsContext.jsx';
import { applySavedView, changeSavedView, readSavedViews, savedViewsKey } from './savedViews.js';

export function SavedViews({ config: explicit }) {
  const inherited = useContext(SavedViewsContext);
  const { user } = useAccess();
  const config = explicit || inherited;
  return config ? (
    <Editor key={`${user?.email}:${config.scopeKey}`} config={config} identity={user?.email} />
  ) : null;
}
function Editor({ config, identity }) {
  const key = savedViewsKey(identity, config.scopeKey);
  const [views, setViews] = useState([]),
    [selected, setSelected] = useState(''),
    [name, setName] = useState(''),
    [periodMode, setPeriodMode] = useState('fixed'),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const chosen = views.find((view) => view.id === selected);
  function refresh() {
    try {
      setViews(readSavedViews(localStorage, key));
      setError('');
    } catch {
      setError('Não foi possível ler as visões favoritas. Nenhuma configuração foi apagada.');
    }
  }
  useEffect(() => {
    refresh();
    const sync = (event) => {
      if (event.key === key || event.key === null) {
        refresh();
        setSelected('');
        setName('');
        setMessage('Lista atualizada em outra aba. Selecione novamente a visão desejada.');
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key]);
  function mutate(type) {
    setMessage('');
    try {
      const reports = Object.fromEntries(
        (config.activeIds || []).map((id) => [
          id,
          {
            visible: config.layout?.effective[id]?.visible !== false,
            mode: config.currentModes?.[id] || config.layout?.effective[id]?.mode || 'default',
          },
        ]),
      );
      const id = type === 'create' ? crypto.randomUUID() : chosen?.id;
      const next = changeSavedView(localStorage, key, {
        type,
        id,
        revision: chosen?.revision,
        name,
        periodMode,
        schema: config.schema || '',
        state: { selection: config.state, reports },
      });
      setViews(next);
      setSelected(type === 'delete' ? '' : id);
      setError('');
      setMessage(type === 'delete' ? 'Visão removida.' : 'Visão salva neste navegador.');
      if (type === 'delete') setName('');
    } catch (e) {
      setError(e.message || 'Não foi possível salvar. As visões anteriores foram preservadas.');
    }
  }
  function apply() {
    try {
      if (!chosen) return;
      const current = readSavedViews(localStorage, key).find((view) => view.id === chosen.id);
      if (!current || current.revision !== chosen.revision)
        throw Error('Esta visão mudou em outra aba. Atualize a lista antes de aplicar.');
      const state = applySavedView(chosen, config.schema);
      const warning = config.validate?.(state.selection);
      if (warning) throw Error(warning);
      config.onApply(state.selection);
      config.layout?.apply(
        Object.fromEntries(
          (config.activeIds || [])
            .filter((id) => Object.hasOwn(state.reports || {}, id))
            .map((id) => [id, state.reports[id]]),
        ),
      );
      setError('');
      setMessage(`Visão “${chosen.name}” aplicada somente nesta categoria.`);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <details className="saved-views" data-no-print>
      <summary>
        Visões favoritas{' '}
        <small>{views.length ? `· ${views.length}` : '· salvar filtros e apresentação'}</small>
      </summary>
      <div className="saved-views-controls">
        <label>
          Visão desta categoria
          <select
            aria-label="Visão favorita"
            value={selected}
            onChange={(e) => {
              const view = views.find((v) => v.id === e.target.value);
              setSelected(e.target.value);
              setName(view?.name || '');
              setPeriodMode(view?.periodMode || 'fixed');
              setMessage('');
              setError('');
            }}
          >
            <option value="">Selecione uma visão…</option>
            {views.map((view) => (
              <option key={view.id} value={view.id}>
                {view.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" disabled={!chosen} onClick={apply}>
          Aplicar visão
        </button>
        <label>
          Nome da visão
          <input
            aria-label="Nome da visão"
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Reunião semanal"
          />
        </label>
        {config.allowRelativePeriod && (
          <label>
            Período ao aplicar
            <select
              aria-label="Período da visão favorita"
              value={periodMode}
              onChange={(e) => setPeriodMode(e.target.value)}
            >
              <option value="fixed">Datas atuais dos filtros</option>
              <option value="currentWeek">Semana atual</option>
              <option value="previousWeek">Semana anterior</option>
              <option value="last7">Últimos 7 dias</option>
            </select>
          </label>
        )}
        <button type="button" disabled={!name.trim()} onClick={() => mutate('create')}>
          Salvar nova visão
        </button>
        {chosen && (
          <>
            <button type="button" onClick={() => mutate('update')}>
              Atualizar com a seleção atual
            </button>
            <button type="button" onClick={() => mutate('rename')}>
              Renomear
            </button>
            <button type="button" onClick={() => mutate('delete')}>
              Remover visão
            </button>
          </>
        )}
      </div>
      <p className="scope">
        Salva filtros, busca e opções de apresentação disponíveis desta categoria. Somente neste
        navegador e usuário; não salva planilhas nem inicia consultas. Escolha e aplique uma visão
        para usá-la.{' '}
        {config.scopeKey.startsWith('orders:') &&
          'O período e a coleta do Zoho permanecem independentes.'}
      </p>
      {error && (
        <p className="error" role="alert">
          {error}{' '}
          <button type="button" onClick={refresh}>
            Atualizar lista
          </button>
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </details>
  );
}
