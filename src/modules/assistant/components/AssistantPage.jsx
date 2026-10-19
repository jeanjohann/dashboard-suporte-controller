/** Perguntas ao agente local: instruções no n8n e ferramenta de leitura com escopo explícito. */
import React, { useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { canOpenAssistantPreview } from '../domain/previewAccess.js';
import { useAccess } from '../../../shared/security/Access.jsx';
import { queryLocalAssistant } from '../data/assistantClient.js';
import './assistant.css';

const tableLabels = {
  label: 'Grupo',
  total: 'Total',
  efetivos: 'Efetivos',
  improdutivos: 'Improdutivos',
  chamados: 'Chamados',
  custoReais: 'Custo (R$)',
  placa: 'Placa',
  cliente: 'Cliente',
  rastreador: 'Rastreador',
  modelo: 'Modelo',
  situacao: 'Situação',
  atendimentosEfetivos: 'OS efetivas',
  chamado: 'Chamado',
  data: 'Data',
  responsavel: 'Responsável',
  motivo: 'Motivo',
  categoria: 'Categoria',
  rastreadores: 'Rastreadores',
  rfid: 'RFID',
  coletoras: 'Coletoras',
};
function QueryTable({ value, title }) {
  if (!value) return null;
  const columns = Object.keys(value.rows[0] || {});
  return (
    <details className="assistant-data" open>
      <summary>
        {title} · {value.total} {value.truncated ? `(exibindo ${value.rows.length})` : ''}
      </summary>
      {value.rows.length ? (
        <div className="assistant-table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((key) => (
                  <th key={key}>{tableLabels[key] || key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {value.rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((key) => (
                    <td key={key}>
                      {row[key] == null
                        ? '—'
                        : typeof row[key] === 'number' && key === 'custoReais'
                          ? row[key].toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : String(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Nenhum registro neste recorte.</p>
      )}
    </details>
  );
}
function Consultation({ result }) {
  const cards = result.cards || [
    ['Visitas e atendimentos', result.metrics.completed],
    ['Atendimentos efetivos', result.metrics.productive],
    ['Visitas improdutivas', result.metrics.unproductive],
    ['Chamados distintos', result.metrics.distinctCompletedCalls],
  ];
  const filters = result.appliedFilters;
  return (
    <div className="assistant-consultation">
      {result.query && (
        <h3>
          {
            {
              atendimentos: 'Atendimentos',
              trocas: 'Trocas e ciclos',
              parque: 'Parque operacional',
            }[result.query.tipo]
          }
          {result.profile === 'demo' ? ' · Dados fictícios' : ''}
        </h3>
      )}
      <p>
        {result.query?.tipo === 'parque'
          ? `Fotografia operacional · referência: ${result.period.referenceDate}`
          : `Período: ${result.period.start} a ${result.period.end} · último realizado: ${result.period.latestCompletedDate}`}
      </p>
      {filters && (
        <p className="scope">
          {[
            filters.cliente && `Cliente: ${filters.cliente}`,
            filters.responsavel &&
              `Responsável (${filters.papel === 'agendamento' ? 'agendamento' : 'execução'}): ${filters.responsavel}`,
            filters.placa && `Placa: ${filters.placa}`,
            result.query.situacao && `Situação: ${result.query.situacao}`,
            result.query.semHistorico && 'Sem OS efetiva vinculada',
          ]
            .filter(Boolean)
            .join(' · ') || 'Sem filtros por cliente, responsável ou placa.'}
        </p>
      )}
      <div className="assistant-response-plan">
        {cards.map(([label, value]) => (
          <article key={label}>
            <h3>{label}</h3>
            <strong>{value == null ? '—' : value.toLocaleString('pt-BR')}</strong>
          </article>
        ))}
      </div>
      <QueryTable
        value={result.ranking}
        title={`Ranking${result.query?.tipo === 'atendimentos' ? ` por ${{ total: 'visitas totais', efetivos: 'atendimentos efetivos', improdutivos: 'visitas improdutivas', custo: 'custo lançado' }[result.query.ordenar || 'total']}` : ''}`}
      />
      <QueryTable value={result.details} title="Registros da consulta" />
      <details>
        <summary>Fonte, critérios e limitações</summary>
        {(result.sources || [result.source]).map((source) => (
          <p key={source.filename}>
            {source.filename} · aba {source.sheets.join(', ')} ·{' '}
            {source.records != null ? `${source.records} registros · ` : ''}modificado em{' '}
            {new Date(source.modifiedAt).toLocaleString('pt-BR')}
            <br />
            SHA-256: <code className="assistant-hash">{source.sha256}</code>
          </p>
        ))}
        <p>Consulta em {new Date(result.generatedAt).toLocaleString('pt-BR')}</p>
        <ul>
          {result.criteria.map((criterion) => (
            <li key={criterion}>{criterion}</li>
          ))}
        </ul>
        {result.completedWithoutValidDate != null && (
          <p>Realizados sem data válida no acervo: {result.completedWithoutValidDate}.</p>
        )}
      </details>
    </div>
  );
}

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
              <span className="assistant-badge">Amostras fictícias · somente leitura</span>
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
              Acervo de teste: 1.000 linhas de OS e 1.000 equipamentos fictícios. Consulte períodos,
              responsáveis, clientes, placas, custos, trocas e parque. Datas relativas usam a última
              data realizada do arquivo, informada no resultado.
            </p>
            <div className="assistant-suggestions">
              {[
                'Quantos atendimentos efetivos, improdutivos e chamados distintos temos no último mês disponível?',
                'Liste os atendimentos executados pelo Jean na semana anterior.',
                'Quais clientes tiveram mais visitas e atendimentos em todo o histórico?',
                'Quais placas tiveram mais trocas em todo o histórico e quais foram elas?',
                'Quantos equipamentos ativos não têm OS efetiva nesta amostra? Agrupe por modelo.',
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
                Sua pergunta e os resultados solicitados são enviados ao Gemini. Neste piloto, as
                ferramentas ampliadas usam somente as amostras fictícias. Não inclua dados reais
                sensíveis na pergunta. Cada pergunta é independente, sem memória de conversa.
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
                  ? `Ferramenta utilizada: ${result.toolName || 'consultar_atendimentos'}.`
                  : 'O agente respondeu sem consultar os dados. Nenhum indicador foi calculado para esta resposta.'}
              </p>
              {result.consulted &&
                (result.consultations || [result]).map((consultation, index) => (
                  <Consultation key={index} result={consultation} />
                ))}
              <h3>Resposta do agente</h3>
              <p className="assistant-answer">{result.answer}</p>
              {result.consulted && (
                <p className="scope">
                  Os cards vêm do cálculo do sistema. A explicação gerada por IA deve ser conferida
                  com esses totais.
                </p>
              )}
            </section>
          )}
        </main>
      </div>
    </SidePanelProvider>
  );
}
