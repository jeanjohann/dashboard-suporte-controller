/** Estrutura visual isolada: não recebe bases reais e não executa chamadas de IA, MCP ou n8n. */
import React, { useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { canOpenAssistantPreview } from '../domain/previewAccess.js';
import { useAccess } from '../../../shared/security/Access.jsx';
import './assistant.css';

const suggestions = [
  ['Monitoramento Ativo', 'Quais veículos estão há mais de três dias offline?'],
  ['Controle de consumo', 'Quais linhas ultrapassaram o limite de consumo neste mês?'],
  ['Equipe de suporte', 'Resuma os atendimentos de um responsável na semana passada.'],
  ['Equipamentos', 'Quais placas tiveram mais trocas de coletora no período?'],
];

export function AssistantPage({ onPage }) {
  const { user } = useAccess();
  const [question, setQuestion] = useState('');
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
              <p>Um lugar para consultar informações e explorar os dados do sistema.</p>
            </div>
            <button type="button" onClick={() => onPage('orders')}>
              Voltar ao sistema
            </button>
          </header>
          <div className="assistant-development" role="status">
            <strong>Em desenvolvimento · acesso de administrador</strong>
            <span>
              Esta página está oculta do menu. Por enquanto, você pode explorar as sugestões e
              preparar uma pergunta. As consultas ainda não estão conectadas.
            </span>
          </div>
          <section className="panel assistant-query" aria-labelledby="assistant-query-title">
            <div className="assistant-heading">
              <h2 id="assistant-query-title">O que você gostaria de consultar?</h2>
              <span className="assistant-badge">Prévia</span>
            </div>
            <p className="scope">
              Escolha um exemplo ou escreva uma pergunta. Nenhuma informação real é enviada nesta
              etapa.
            </p>
            <div className="assistant-suggestions">
              {suggestions.map(([label, text]) => (
                <button key={label} type="button" onClick={() => setQuestion(text)}>
                  <strong>{label}</strong>
                  <span>{text}</span>
                </button>
              ))}
            </div>
            <label htmlFor="assistant-question">Sua pergunta</label>
            <textarea
              id="assistant-question"
              rows={4}
              maxLength={2000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex.: mostre os atendimentos de um cliente neste mês…"
              aria-describedby="assistant-query-status"
            />
            <div className="assistant-query-footer">
              <span id="assistant-query-status" className="scope">
                Consulta aguardando integração. O rascunho permanece somente nesta sessão.
              </span>
              <button type="button" disabled>
                Consultar · em breve
              </button>
            </div>
          </section>
          <section className="panel assistant-next" aria-labelledby="assistant-next-title">
            <h2 id="assistant-next-title">Como queremos apresentar as respostas</h2>
            <div className="assistant-response-plan">
              <article>
                <h3>Resumo claro</h3>
                <p>Explicação dos resultados com período, fonte e última atualização.</p>
              </article>
              <article>
                <h3>Conferência dos dados</h3>
                <p>Acesso aos registros e aos critérios usados nos indicadores.</p>
              </article>
              <article>
                <h3>Próximo passo</h3>
                <p>
                  Atalhos planejados para abrir a tabela filtrada, o histórico ou preparar um
                  relatório.
                </p>
              </article>
            </div>
            <p className="scope">
              Esses recursos serão desenvolvidos por etapas. Nesta prévia não há respostas geradas,
              acesso às planilhas ou alterações nos acompanhamentos.
            </p>
          </section>
        </main>
      </div>
    </SidePanelProvider>
  );
}
