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
import { PageConfigurationButton } from '../../../components/PageConfigurationButton.jsx';
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
          if (inspected.types.includes('consumption'))
            throw Error(
              'Extrato de consumo: importe na página KORE ou Arqia para manter a fonte separada.',
            );
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
              <p>
                Carregue OS, Operacional e Logística. Extratos de consumo são importados nas páginas
                KORE e Arqia.
              </p>
            </div>
            <div className="page-header-actions">
              <PageConfigurationButton
                scope="Central de arquivos"
                description="Formatos aceitos e como os lotes são aplicados."
              >
                <section>
                  <h3>Arquivos reconhecidos</h3>
                  <p>
                    Excel: abas OS 2025_26 ou OS 2025, Equipamentos, ou Envios + Devoluções. CSV:
                    formatos de consumo suportados nas páginas KORE e Arqia.
                  </p>
                </section>
                <section>
                  <h3>Conferência e aplicação</h3>
                  <p>
                    Selecione as bases que deseja importar, confira o resumo de cada arquivo e então
                    aplique o lote. Bases de consumo são carregadas nas páginas das operadoras.
                  </p>
                </section>
                <section>
                  <h3>Armazenamento das bases</h3>
                  <p>
                    OS e Operacional substituem apenas a referência atual de seus módulos; não são
                    corrigidos nem misturados com outras versões. Extratos de consumo ficam no
                    histórico local deste navegador; arquivos idênticos não são somados novamente.
                    Lotes conflitantes não são aplicados. Nenhum arquivo é enviado ao GitHub.
                  </p>
                </section>
                <section>
                  <h3>Abrir módulo</h3>
                  <div className="report-downloads">
                    <button type="button" onClick={() => onPage('orders')}>
                      Ordens de Serviço
                    </button>
                    <button type="button" onClick={() => onPage('operational')}>
                      Operacional
                    </button>
                    <button type="button" onClick={() => onPage('operational-analysis')}>
                      Parque e Manutenção
                    </button>
                    <button type="button" onClick={() => onPage('lines')}>
                      Consumo M2M
                    </button>
                  </div>
                </section>
              </PageConfigurationButton>
              <PermissionButton
                action="import"
                disabled={busy}
                onClick={() => input.current.click()}
              >
                {busy ? 'Processando…' : 'Selecionar arquivos'}
              </PermissionButton>
            </div>
            <input hidden ref={input} type="file" accept=".xlsx,.xls" multiple onChange={inspect} />
          </header>
          <SavedSourcesPanel storage={savedSources} />
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
        </main>
      </div>
    </SidePanelProvider>
  );
}
