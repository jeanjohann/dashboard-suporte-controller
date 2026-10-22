/**
 * Importação conjunta das bases autorizadas, com reconhecimento e conferência antes da aplicação.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../../../shared/security/Access.jsx';
import {
  authorizeAction,
  accessUser,
  accessManaged,
} from '../../../shared/security/accessClient.js';
import { allowsSource } from '../../../shared/security/permissions.js';
import React, { useRef, useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SavedSourcesPanel } from '../../../shared/persistence/SavedSourcesPanel.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { inspectImportFile, assembleImportBatch, importTypeLabels } from '../domain/bulkImport.js';
/** Apresenta a prévia dos arquivos reconhecidos e aplica somente o lote selecionado e autorizado. */
export function ImportPage({ onPage, onApply, orders, operational, logistics, savedSources }) {
  const input = useRef(),
    [items, setItems] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function inspect(event) {
    if (!(await authorizeAction('import'))) {
      event.target.value = '';
      return;
    }
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    setBusy(true);
    setError('');
    setMessage('');
    const results = [];
    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        try {
          const inspected = await inspectImportFile(file);
          if (accessManaged() && inspected.types.some((type) => !allowsSource(accessUser(), type)))
            throw Error('Você não tem acesso a todas as bases deste arquivo.');
          results.push({ ...inspected, key: index, selected: true });
        } catch (e) {
          results.push({
            key: index,
            filename: file.name,
            types: [],
            selected: false,
            error: e.message,
          });
        }
      }
      setItems(results);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }
  const selected = items.filter((item) => item.selected);
  let batchError = '';
  try {
    assembleImportBatch(selected);
  } catch (e) {
    batchError = e.message;
  }
  async function apply() {
    if (!(await authorizeAction('import'))) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const batch = assembleImportBatch(selected);
      await onApply(batch);
      setMessage(
        `${selected.length} arquivo(s) aplicados. As páginas dos módulos já estão atualizadas.`,
      );
      setItems([]);
    } catch (e) {
      setError(e.message + ' O lote não foi aplicado. Os dados anteriores foram mantidos.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <SidePanelProvider>
      <div className="app import-page">
        <Navigation page="imports" onPage={onPage} />
        <main>
          <header>
            <div>
              <div className="eyebrow">CENTRAL DE ARQUIVOS</div>
              <h1>Importação</h1>
              <p>Carregue OS, operacional, logística e extratos de consumo em uma única seleção.</p>
            </div>
            <PermissionButton action="import" disabled={busy} onClick={() => input.current.click()}>
              {busy ? 'Processando…' : 'Selecionar arquivos'}
            </PermissionButton>
            <input
              hidden
              ref={input}
              type="file"
              accept=".xlsx,.xls,.csv"
              multiple
              onChange={inspect}
            />
          </header>
          <SavedSourcesPanel storage={savedSources} />
          <div className="notice">
            Excel é identificado pelas abas OS 2025_26 ou OS 2025, Equipamentos ou Envios +
            Devoluções; CSV usa os formatos de consumo já suportados. Selecione uma OS, um
            operacional, uma logística e quantos extratos de consumo precisar. Confira o lote abaixo
            antes de aplicar.
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="line-message" role="status">
              {message}
            </p>
          )}
          <section className="cards">
            <article>
              <span>OS carregada na sessão</span>
              <strong>{orders?.data.rows.length.toLocaleString('pt-BR') || '—'}</strong>
              <small>{orders?.filename || 'Não importada'}</small>
            </article>
            <article>
              <span>Operacional carregado na sessão</span>
              <strong>{operational?.data.rows.length.toLocaleString('pt-BR') || '—'}</strong>
              <small>{operational?.filename || 'Não importado'}</small>
            </article>
            <article>
              <span>Logística carregada na sessão</span>
              <strong>{logistics?.data.rows.length.toLocaleString('pt-BR') || '—'}</strong>
              <small>{logistics?.filename || 'Não importada'}</small>
            </article>
          </section>
          {!!items.length && (
            <section className="panel import-preview">
              <h2>Conferir arquivos</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Incluir</th>
                      <th>Arquivo</th>
                      <th>Tipo identificado</th>
                      <th>Resumo / revisão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.key}>
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Incluir ${item.filename}`}
                            disabled={busy || Boolean(item.error)}
                            checked={item.selected}
                            onChange={(e) =>
                              setItems((previous) =>
                                previous.map((row) =>
                                  row.key === item.key
                                    ? { ...row, selected: e.target.checked }
                                    : row,
                                ),
                              )
                            }
                          />
                        </td>
                        <td>{item.filename}</td>
                        <td>
                          {item.types.map((type) => importTypeLabels[type]).join(' + ') ||
                            'Não reconhecido'}
                        </td>
                        <td>{item.error || item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {batchError && (
                <p className="scope" role="status">
                  {batchError}
                </p>
              )}
              <div className="report-downloads">
                <PermissionButton
                  action="import"
                  disabled={busy || Boolean(batchError)}
                  onClick={apply}
                >
                  Aplicar arquivos selecionados
                </PermissionButton>
                <button
                  disabled={busy}
                  onClick={() => {
                    setItems([]);
                    setError('');
                  }}
                >
                  Limpar seleção
                </button>
              </div>
            </section>
          )}
          <section className="panel import-preview">
            <h2>Como os arquivos são tratados</h2>
            <p>
              OS e operacional substituem apenas a referência atual de seus módulos; não são
              corrigidos nem misturados com outras versões.
            </p>
            <p>
              Extratos de consumo são salvos no histórico local deste navegador. Arquivos idênticos
              não são somados novamente. Novas versões seguem as regras existentes de arquivamento;
              versões conflitantes no mesmo lote impedem sua aplicação.
            </p>
            <p>
              Quando o lote contém consumo e operacional, essa referência operacional também
              acompanha o histórico de consumo. OS e operacional continuam disponíveis para análise
              durante a sessão. Nenhum arquivo é enviado ao GitHub.
            </p>
            <div className="report-downloads">
              <button onClick={() => onPage('orders')}>Ordens de Serviço</button>
              <button onClick={() => onPage('operational')}>Operacional</button>
              <button onClick={() => onPage('operational-analysis')}>Parque e Manutenção</button>
              <button onClick={() => onPage('lines')}>Consumo M2M</button>
            </div>
          </section>
        </main>
      </div>
    </SidePanelProvider>
  );
}
