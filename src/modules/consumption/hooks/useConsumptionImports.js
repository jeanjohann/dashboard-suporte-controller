/** Fluxos de importação, versões e backups. Valida e autoriza antes de gravar pelo repositório existente. */
import { useEffect, useRef, useState } from 'react';
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
import {
  carrierArchive,
  restoreCarrierArchive,
  koreStatementText,
} from '../domain/carrierWorkspace.js';
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
  expectedOperator = '',
}) {
  const { archive, setBusy, setError, setMessage, commit } = history;
  const [pending, setPending] = useState([]),
    [backup, setBackup] = useState(null);
  const input = useRef(),
    operationalInput = useRef(),
    backupInput = useRef();
  const operatorRef = useRef(expectedOperator);
  operatorRef.current = expectedOperator;
  useEffect(() => {
    setPending([]);
    setBackup(null);
  }, [expectedOperator]);
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
      if (!expectedOperator) throw Error('Importe os extratos na página KORE ou Arqia.');
      const candidates = [];
      for (const file of files) {
        const text = decode(await file.arrayBuffer()),
          id = await fileDigest(text);
        const record = { id, text, filename: file.name, importedAt: new Date().toISOString() },
          parsed = importLineStatement(text, file.name, id);
        if (parsed.operator !== expectedOperator)
          throw Error(
            `Este extrato é ${parsed.operator}. Abra a página da operadora correspondente.`,
          );
        candidates.push({ file: record, parsed });
      }
      // Confere conflitos antes de oferecer a prévia; nenhum extrato é gravado só por selecionar um arquivo.
      mergeHistoryFiles(
        archive.files,
        candidates.map((item) => item.file),
      );
      if (operatorRef.current === expectedOperator) setPending(candidates);
    } catch (e) {
      setError(e.message + ' Os arquivos do histórico foram mantidos.');
    } finally {
      event.target.value = '';
      setBusy(false);
    }
  }
  async function previewKore(snapshot, period) {
    if (!(await authorizeAction('import'))) return;
    setError('');
    try {
      if (expectedOperator !== 'Kore') throw Error('Abra a página KORE.');
      const text = koreStatementText(snapshot, period),
        id = await fileDigest(text);
      const filename = `KORE-API-${period.start}-${period.end}.csv`;
      const file = {
        id,
        text,
        filename,
        importedAt: new Date().toISOString(),
        origin: 'kore-api',
        apiReadAt: snapshot.readAt,
      };
      const parsed = importLineStatement(text, filename, id);
      mergeHistoryFiles(archive.files, [file]);
      if (operatorRef.current === expectedOperator) setPending([{ file, parsed }]);
    } catch (e) {
      setError(e.message);
    }
  }
  async function savePending() {
    // Reconsulta a autorização e valida o lote novamente, considerando o histórico atual.
    if (!(await authorizeAction('import'))) return;
    try {
      if (!expectedOperator || pending.some((item) => item.parsed.operator !== expectedOperator))
        throw Error('Confira os extratos na página da operadora correspondente.');
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
      if (!expectedOperator) throw Error('Restaure o backup na página da operadora.');
      setBackup(carrierArchive(await validateBackup(await file.text()), expectedOperator));
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
      await commit(
        restoreCarrierArchive(archive, backup, expectedOperator),
        centralSources
          ? 'Consumo restaurado neste navegador. A base operacional do banco foi mantida.'
          : 'Backup restaurado neste navegador.',
      );
      setBackup(null);
      onResetFilters();
      onClearDetail();
      onClearTracked();
    } catch {}
  }
  function exportBackup() {
    download(
      JSON.stringify(
        { ...carrierArchive(archive, expectedOperator), exportedAt: new Date().toISOString() },
        null,
        2,
      ),
      'application/json',
      'addlog-historico-consumo-' + expectedOperator + '-' + today() + '.json',
    );
  }

  async function changeVersion(file) {
    try {
      if (importLineStatement(file.text, file.filename, file.id).operator !== expectedOperator)
        throw Error('Altere versões na página da operadora correspondente.');
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
    previewKore,
    loadOperational,
    savePending,
    readBackup,
    restoreBackup,
    exportBackup,
    changeVersion,
    saveOperationalReference,
  };
}
