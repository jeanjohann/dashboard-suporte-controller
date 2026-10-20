import { useEffect, useState } from 'react';
import { localId } from '../../../shared/data/localId.js';
import { emptyDashboardDocument } from '../domain/layout.js';
import { dashboardRepository } from '../data/dashboardRepository.js';
import { appendDashboards, copyDashboard } from '../domain/boardActions.js';

const freshBoard = (name = 'Meu primeiro painel') => ({ id: localId(), name, widgets: [] });
/** Edição em memória, gravação explícita e cópia anterior intacta se o navegador falhar. */
export function useDashboards(owner, repository = dashboardRepository) {
  const [document, setDocument] = useState(emptyDashboardDocument);
  const [edition, setEdition] = useState(() => ({ draft: freshBoard(), past: [] }));
  const { draft, past } = edition;
  const resetDraft = (next) => setEdition({ draft: next, past: [] });
  const setDraft = (update) =>
    setEdition((old) => {
      const next = typeof update === 'function' ? update(old.draft) : update;
      if (JSON.stringify(next) === JSON.stringify(old.draft)) return old;
      return { draft: next, past: [...old.past, old.draft].slice(-30) };
    });
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
          resetDraft(next.dashboards[0] || freshBoard());
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
    canUndo: past.length > 0,
    undo() {
      setEdition((old) =>
        old.past.length
          ? {
              draft: old.past.at(-1),
              past: old.past.slice(0, -1),
            }
          : old,
      );
    },
    reportError(value) {
      setError(value);
      setMessage('');
    },
    notify(value) {
      setMessage(value);
      setError('');
    },
    async save() {
      return commit(
        {
          ...document,
          dashboards: saved
            ? document.dashboards.map((board) => (board.id === draft.id ? draft : board))
            : [...document.dashboards, draft],
        },
        () => setEdition((old) => ({ ...old, past: [] })),
      );
    },
    newBoard(template) {
      resetDraft(
        template
          ? copyDashboard(
              template,
              document.dashboards.map((b) => b.name),
              localId,
              template.name,
            )
          : freshBoard('Novo painel'),
      );
      setMessage('');
      setError('');
    },
    open(id) {
      const board = document.dashboards.find((row) => row.id === id);
      if (board) {
        resetDraft(board);
        setMessage('');
      }
    },
    discard() {
      resetDraft(saved || freshBoard());
      setMessage('Alterações descartadas.');
    },
    async remove() {
      return commit(
        { ...document, dashboards: document.dashboards.filter((row) => row.id !== draft.id) },
        (next) => resetDraft(next.dashboards[0] || freshBoard()),
        'Painel excluído dos salvos neste navegador.',
      );
    },
    duplicate() {
      if (document.dashboards.length >= 12) return setError('Limite de 12 painéis atingido.');
      resetDraft(
        copyDashboard(
          draft,
          document.dashboards.map((b) => b.name),
          localId,
        ),
      );
      setMessage('Cópia criada a partir da edição atual. Salve para guardar o novo painel.');
      setError('');
    },
    async importBoards(boards, user) {
      try {
        const next = appendDashboards(document, boards, user, localId);
        return commit(
          next,
          (result) => resetDraft(result.dashboards[document.dashboards.length]),
          'Backup importado como novas cópias. Os painéis anteriores foram preservados.',
        );
      } catch (error) {
        setError(error.message);
        return false;
      }
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
