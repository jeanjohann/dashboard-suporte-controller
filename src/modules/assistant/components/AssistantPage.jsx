/** Perguntas ao agente local: instruções no n8n e ferramenta de leitura com escopo explícito. */
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
  const [question, setQuestion] = useState(
    'Quantos atendimentos efetivos, improdutivos e chamados distintos temos no último mês disponível?',
  );
  async function consult() {
    if (busy) return;
    setBusy(true);
    setResult(null);
    setError('');
    try {
      setResult(await queryLocalAssistant(question));
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
              <p>Faça perguntas ao agente e confira as fontes utilizadas na resposta.</p>
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
              <h2 id="assistant-query-title">Pergunte ao agente de suporte</h2>
              <span className="assistant-badge">Consulta real · somente leitura</span>
            </div>
            <p className="scope">
              <a
                href="http://localhost:5678/workflow/labAssistantAgent01"
                target="_blank"
                rel="noreferrer"
              >
                Abrir fluxo atual do agente no n8n
              </a>
            </p>
            <p className="scope">
              Ferramenta disponível: totais de atendimentos do último mês com realizados na OS.
              Outros períodos, clientes, responsáveis e assuntos ainda não têm ferramentas de
              consulta.
            </p>
            <div className="assistant-suggestions">
              {[
                'Quantos atendimentos efetivos, improdutivos e chamados distintos temos no último mês disponível?',
                'Qual é o critério para separar visitas improdutivas?',
                'Qual período está disponível e quais são as limitações dos dados?',
              ].map((text) => (
                <button key={text} type="button" disabled={busy} onClick={() => setQuestion(text)}>
                  {text}
                </button>
              ))}
            </div>
            <label htmlFor="assistant-question">Sua pergunta</label>
            <textarea
              id="assistant-question"
              rows={3}
              maxLength={1000}
              value={question}
              disabled={busy}
              onChange={(e) => setQuestion(e.target.value)}
              aria-describedby="assistant-query-status"
            />
            <div className="assistant-query-footer">
              <span id="assistant-query-status" className="scope">
                Sua pergunta é enviada ao Gemini. Evite incluir dados sensíveis. A ferramenta envia
                somente totais, período e critérios, sem linhas ou identificadores dos clientes.
                Cada pergunta é independente, sem memória de conversa.
              </span>
              <button type="button" onClick={consult} disabled={busy || question.trim().length < 3}>
                {busy ? 'Consultando agente…' : 'Enviar pergunta'}
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
                <strong>Pergunta:</strong> {result.question}
              </p>
              <p className="scope">
                {result.consulted
                  ? 'Ferramenta utilizada: consultar_atendimentos.'
                  : 'O agente respondeu sem consultar os dados. Nenhum indicador foi calculado para esta resposta.'}
              </p>
              {result.consulted && (
                <>
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
                </>
              )}
              <h3>Resposta do agente</h3>
              <p className="assistant-answer">{result.answer}</p>
              {result.consulted && (
                <>
                  <p className="scope">
                    Os cards vêm do cálculo do sistema. A explicação gerada por IA deve ser
                    conferida com esses totais.
                  </p>
                  <details>
                    <summary>Fonte, critérios e limitações</summary>
                    <p>
                      {result.source.filename} · aba {result.source.sheets.join(', ')} · modificado
                      em {new Date(result.source.modifiedAt).toLocaleString('pt-BR')}
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
                      O mês pode estar incompleto. Os totais exibidos correspondem somente ao
                      recorte retornado pela ferramenta.
                    </p>
                  </details>
                </>
              )}
            </section>
          )}
        </main>
      </div>
    </SidePanelProvider>
  );
}
