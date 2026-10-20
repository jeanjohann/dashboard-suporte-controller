/** Estado da persistência local: confirma gravações antes de substituir o histórico apresentado. */
import { useEffect, useState } from 'react';
import { emptyHistory } from '../data/consumptionHistory.js';
import { consumptionHistoryRepository } from '../data/historyRepository.js';
export function useConsumptionArchive(reloadToken, repository = consumptionHistoryRepository) {
  const [archive, setArchive] = useState(emptyHistory),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  useEffect(() => {
    // Uma resposta de leitura antiga não deve sobrescrever a recarga disparada pela importação em lote.
    let live = true;
    setReady(false);
    repository
      .read()
      .then((value) => {
        if (live) {
          setArchive(value);
          setReady(true);
          setError('');
        }
      })
      .catch((e) => {
        if (live) {
          setError(
            'Não foi possível abrir o histórico local. Recarregue a página antes de importar arquivos: ' +
              e.message,
          );
        }
      });
    return () => {
      live = false;
    };
  }, [reloadToken, repository]);
  async function commit(next, success) {
    setBusy(true);
    setError('');
    try {
      // Só apresenta o novo histórico depois de o armazenamento confirmar a transação.
      await repository.write(next);
      setArchive(next);
      setMessage(success);
    } catch (e) {
      setError('Não foi possível salvar. O histórico anterior foi mantido. ' + e.message);
      throw e;
    } finally {
      setBusy(false);
    }
  }

  return { archive, ready, busy, error, message, setBusy, setError, setMessage, commit };
}
