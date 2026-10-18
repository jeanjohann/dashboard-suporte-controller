/** Piloto local explícito: uma consulta fixa, totais calculados e explicação do Gemini. */
import React, { useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { canOpenAssistantPreview } from '../domain/previewAccess.js';
import { useAccess } from '../../../shared/security/Access.jsx';
import { queryLocalAssistant } from '../data/assistantClient.js';
import './assistant.css';

export function AssistantPage({ onPage }) {
  const { user } = useAccess();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  async function consult() {
    if (busy) return;
    setBusy(true);
    setResult(null);
    setError('');
    try {
      setResult(await queryLocalAssistant());
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!canOpenAssistantPreview(user)) return null;
  return (
    <SidePanelProvider>
      <div className="app assistant-lab">
        <Navigation page="assistant-lab" onPage={onPage} />
        <main>
          <header>
            <div>
              <p className="eyebrow">ESPAÇO EXPERIMENTAL</p>
              <h1>Assistente de suporte</h1>
              <p>Consulte os totais do acervo local com uma explicação do Gemini.</p>
            </div>
            <button type="button" onClick={() => onPage('orders')}>
              Voltar ao sistema
            </button>
          </header>
          <div className="assistant-development" role="status">
            <strong>Piloto local · administrador principal</strong>
            <span>
              Mantenha este computador e o laboratório ligados. A consulta lê a pasta import,
              independentemente dos arquivos e filtros abertos nas outras páginas do sistema.
            </span>
          </div>
          <section className="panel assistant-query" aria-labelledby="assistant-query-title">
            <div className="assistant-heading">
              <h2 id="assistant-query-title">Volume de atendimentos</h2>
              <span className="assistant-badge">Consulta real · somente leitura</span>
            </div>
            <p className="scope">
              Quantos chamados distintos, atendimentos efetivos e visitas improdutivas existem no
              último mês com realizados na planilha?
            </p>
            <div className="assistant-query-footer">
              <span id="assistant-query-status" className="scope">
                Ao consultar, somente totais, período e critérios seguem para o Gemini. Não são
                enviados clientes, placas, CNPJs, chamados ou linhas das planilhas.
              </span>
              <button type="button" onClick={consult} disabled={busy}>
                {busy ? 'Consultando acervo e Gemini…' : 'Consultar atendimentos'}
              </button>
            </div>
          </section>
          {busy && (
            <p role="status">
              A consulta pode levar até dois minutos. Aguarde sem fechar a página.
            </p>
          )}
          {error && (
            <div className="assistant-development" role="alert">
              {error}
            </div>
          )}
          {result && (
            <section className="panel assistant-next" aria-labelledby="assistant-result-title">
              <h2 id="assistant-result-title">Resultado da consulta</h2>
              <p>
                Período: {result.period.start} a {result.period.end} · último realizado:{' '}
                {result.period.latestCompletedDate}
              </p>
              <div className="assistant-response-plan">
                {[
                  ['Visitas e atendimentos', result.metrics.completed],
                  ['Atendimentos efetivos', result.metrics.productive],
                  ['Visitas improdutivas', result.metrics.unproductive],
                  ['Chamados distintos', result.metrics.distinctCompletedCalls],
                ].map(([label, value]) => (
                  <article key={label}>
                    <h3>{label}</h3>
                    <strong>{value}</strong>
                  </article>
                ))}
              </div>
              <h3>Explicação do Gemini</h3>
              <p className="assistant-answer">{result.answer}</p>
              <p className="scope">
                Os cards vêm do cálculo do sistema. A explicação gerada por IA deve ser conferida
                com esses totais.
              </p>
              <details>
                <summary>Fonte, critérios e limitações</summary>
                <p>
                  {result.source.filename} · aba {result.source.sheets.join(', ')} · modificado em{' '}
                  {new Date(result.source.modifiedAt).toLocaleString('pt-BR')}
                </p>
                <p>
                  Consulta em {new Date(result.generatedAt).toLocaleString('pt-BR')} · SHA-256:{' '}
                  <code className="assistant-hash">{result.source.sha256}</code>
                </p>
                <ul>
                  {result.criteria.map((criterion) => (
                    <li key={criterion}>{criterion}</li>
                  ))}
                </ul>
                <p>
                  Realizados sem data válida no acervo: {result.completedWithoutValidDate}.
                  Apontamentos do leitor na OS: {result.source.issues}. Linhas sem número de OS
                  ignoradas pelo leitor: {result.source.skipped}.
                </p>
                <p>
                  O mês pode estar incompleto. Não há filtro personalizado ou perguntas livres neste
                  primeiro piloto.
                </p>
              </details>
            </section>
          )}
        </main>
      </div>
    </SidePanelProvider>
  );
}
