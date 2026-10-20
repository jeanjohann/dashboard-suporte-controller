import { useEffect, useState } from 'react';
import { localId } from '../../../shared/data/localId.js';
import { emptyDashboardDocument } from '../domain/layout.js';
import { dashboardRepository } from '../data/dashboardRepository.js';

const freshBoard = (name = 'Meu primeiro painel') => ({ id: localId(), name, widgets: [] });
/** Edição em memória, gravação explícita e cópia anterior intacta se o navegador falhar. */
export function useDashboards(owner, repository = dashboardRepository) {
  const [document, setDocument] = useState(emptyDashboardDocument);
  const [draft, setDraft] = useState(() => freshBoard());
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  useEffect(() => {
    let cancelled = false;
    repository
      .read(owner)
      .then((next) => {
        if (!cancelled) {
          setDocument(next);
          setDraft(next.dashboards[0] || freshBoard());
          setReady(true);
        }
      })
      .catch((error) => {
        if (!cancelled) setError(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [owner, repository]);
  const saved = document.dashboards.find((board) => board.id === draft.id);
  const dirty = saved
    ? JSON.stringify(saved) !== JSON.stringify(draft)
    : Boolean(draft.widgets.length || draft.name !== 'Meu primeiro painel');
  async function commit(next, after, success = 'Dashboard salvo neste navegador.') {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await repository.write(owner, next);
      setDocument(result);
      after?.(result);
      setMessage(success);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return {
    document,
    draft,
    setDraft,
    ready,
    busy,
    error,
    message,
    dirty,
    saved,
    async save() {
      return commit({
        ...document,
        dashboards: saved
          ? document.dashboards.map((board) => (board.id === draft.id ? draft : board))
          : [...document.dashboards, draft],
      });
    },
    newBoard() {
      setDraft(freshBoard('Novo painel'));
      setMessage('');
      setError('');
    },
    open(id) {
      const board = document.dashboards.find((row) => row.id === id);
      if (board) {
        setDraft(board);
        setMessage('');
      }
    },
    discard() {
      setDraft(saved || freshBoard());
      setMessage('Alterações descartadas.');
    },
    async remove() {
      return commit(
        { ...document, dashboards: document.dashboards.filter((row) => row.id !== draft.id) },
        (next) => setDraft(next.dashboards[0] || freshBoard()),
        'Painel excluído dos salvos neste navegador.',
      );
    },
    async reload() {
      setBusy(true);
      setError('');
      try {
        const next = await repository.read(owner);
        setDocument(next);
        setReady(true);
        setMessage(
          'Painéis salvos recarregados. Sua edição foi mantida; salvar substituirá a versão deste painel.',
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setBusy(false);
      }
    },
  };
}
