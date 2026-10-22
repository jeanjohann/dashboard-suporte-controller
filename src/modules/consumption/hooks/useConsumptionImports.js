/** Fluxos de importação, versões e backups. Valida e autoriza antes de gravar pelo repositório existente. */
import { useRef, useState } from 'react';
import {
  authorizeAction,
  accessManaged,
  accessUser,
} from '../../../shared/security/accessClient.js';
import { allowsSource } from '../../../shared/security/permissions.js';
import { importOperational } from '../../operational/domain/operational.js';
import {
  importLineStatement,
  mergeHistoryFiles,
  toggleHistoryFile,
} from '../domain/lineConsumption.js';
import { fileDigest, validateBackup } from '../data/consumptionHistory.js';
import { download } from '../../../shared/export/exports.js';
import { currentDate as today } from '../utils/consumptionFormatting.js';
const decode = (buffer) => {
  let text = new TextDecoder('utf-8').decode(buffer);
  return text.includes('\uFFFD') ? new TextDecoder('windows-1252').decode(buffer) : text;
};

export function useConsumptionImports({
  history,
  operational,
  onOperationalChange,
  onResetFilters,
  onClearDetail,
  onClearTracked,
  onReviewBackup,
  centralSources = false,
}) {
  const { archive, setBusy, setError, setMessage, commit } = history;
  const [pending, setPending] = useState([]),
    [backup, setBackup] = useState(null);
  const input = useRef(),
    operationalInput = useRef(),
    backupInput = useRef();
  async function load(event) {
    if (!(await authorizeAction('import'))) {
      event.target.value = '';
      return;
    }
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const candidates = [];
      for (const file of files) {
        const text = decode(await file.arrayBuffer()),
          id = await fileDigest(text);
        const record = { id, text, filename: file.name, importedAt: new Date().toISOString() },
          parsed = importLineStatement(text, file.name, id);
        candidates.push({ file: record, parsed });
      }
      // Confere conflitos antes de oferecer a prévia; nenhum extrato é gravado só por selecionar um arquivo.
      mergeHistoryFiles(
        archive.files,
        candidates.map((item) => item.file),
      );
      setPending(candidates);
    } catch (e) {
      setError(e.message + ' Os arquivos do histórico foram mantidos.');
    } finally {
      event.target.value = '';
      setBusy(false);
    }
  }
  async function savePending() {
    // Reconsulta a autorização e valida o lote novamente, considerando o histórico atual.
    if (!(await authorizeAction('import'))) return;
    try {
      const files = mergeHistoryFiles(
        archive.files,
        pending.map((item) => item.file),
      );
      await commit({ ...archive, files }, 'Extratos salvos no histórico deste navegador.');
      setPending([]);
      onResetFilters();
      onClearDetail();
    } catch {}
  }
  async function loadOperational(event) {
    if (!(await authorizeAction('import'))) {
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      if (accessManaged() && !allowsSource(accessUser(), 'operational'))
        throw Error('Importação operacional não autorizada.');
      const source = {
        filename: file.name,
        data: importOperational(await file.arrayBuffer()),
        savedAt: new Date().toISOString(),
      };
      if (centralSources) {
        await onOperationalChange(source);
        setMessage(
          'Base operacional completa salva no banco. A referência dos backups locais não foi substituída.',
        );
        onClearDetail();
        return;
      }
      await commit(
        { ...archive, operational: source },
        'Referência operacional salva para os vínculos.',
      );
      await onOperationalChange?.(source);
      onClearDetail();
    } catch (e) {
      setError(e.message);
    } finally {
      event.target.value = '';
      setBusy(false);
    }
  }
  async function readBackup(event) {
    if (!(await authorizeAction('import'))) {
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      setBackup(await validateBackup(await file.text()));
      onReviewBackup();
    } catch (e) {
      setError(e.message);
    } finally {
      event.target.value = '';
      setBusy(false);
    }
  }
  async function restoreBackup() {
    // O backup foi validado na revisão; a substituição ocorre somente nesta confirmação explícita.
    if (!(await authorizeAction('import'))) return;
    try {
      if (accessManaged() && backup?.operational && !allowsSource(accessUser(), 'operational'))
        throw Error('Este backup contém uma base operacional que você não pode importar.');
      await commit(
        backup,
        centralSources
          ? 'Consumo restaurado neste navegador. A base operacional do banco foi mantida.'
          : 'Backup restaurado neste navegador.',
      );
      if (backup.operational && !centralSources) await onOperationalChange?.(backup.operational);
      setBackup(null);
      onResetFilters();
      onClearDetail();
      onClearTracked();
    } catch {}
  }
  function exportBackup() {
    download(
      JSON.stringify({ ...archive, exportedAt: new Date().toISOString() }, null, 2),
      'application/json',
      'addlog-historico-consumo-' + today() + '.json',
    );
  }

  async function changeVersion(file) {
    try {
      const files = toggleHistoryFile(archive.files, file.id);
      await commit(
        { ...archive, files },
        file.active === false ? 'Versão reativada.' : 'Versão arquivada; original preservado.',
      );
      onClearDetail();
    } catch (e) {
      setError(e.message);
    }
  }
  /** Guarda a fotografia operacional atual, sem alterar o vínculo histórico das ações. */
  function saveOperationalReference() {
    commit(
      { ...archive, operational: { ...operational, savedAt: new Date().toISOString() } },
      'Referência operacional guardada.',
    ).catch(() => {});
  }

  return {
    pending,
    setPending,
    backup,
    setBackup,
    input,
    operationalInput,
    backupInput,
    load,
    loadOperational,
    savePending,
    readBackup,
    restoreBackup,
    exportBackup,
    changeVersion,
    saveOperationalReference,
  };
}
