/** Estado explícito da conexão; nada é consultado antes da escolha do administrador. */
import React from 'react';
import { Icon } from '../../../components/Icon.jsx';

export function OrdersGooglePanel({ google, manualBusy, operational = false }) {
  if (!google.allowed || !google.open) return null;
  return (
    <section className="orders-google-panel" aria-label="Conexão Google Sheets">
      <div className="orders-google-heading">
        <strong>Google Sheets · piloto {operational ? 'do Operacional' : 'de OS'}</strong>
        <button
          type="button"
          aria-label="Fechar conexão Google Sheets"
          onClick={() => google.setOpen(false)}
        >
          <Icon name="close" />
        </button>
      </div>
      <p>
        {google.status?.configured
          ? `Aba ${google.status.sheetName}. Leitura privada, disponível apenas para administradores.`
          : google.status
            ? 'A conexão ainda precisa ser configurada no servidor. A importação de arquivos continua disponível.'
            : 'Conferindo a configuração da conexão…'}
      </p>
      {google.connected && (
        <p role="status">
          Última leitura bem-sucedida:{' '}
          {new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'America/Sao_Paulo',
          }).format(new Date(google.readAt))}{' '}
          (Brasília).
        </p>
      )}
      <div className="orders-google-actions">
        {google.status?.configured && (
          <>
            <button type="button" disabled={google.busy || manualBusy} onClick={google.refresh}>
              {google.busy
                ? 'Consultando Google…'
                : google.connected
                  ? operational
                    ? 'Atualizar Operacional agora'
                    : 'Atualizar OS agora'
                  : operational
                    ? 'Carregar Operacional do Google'
                    : 'Carregar OS do Google'}
            </button>
            <label>
              <input
                type="checkbox"
                checked={google.automatic}
                onChange={(event) => google.setAutomatic(event.target.checked)}
              />
              Atualizar a cada 15 min enquanto{' '}
              {operational ? 'o Operacional estiver aberto' : 'as OS estiverem abertas'}
            </label>
          </>
        )}
        {!google.status?.configured && (
          <button type="button" onClick={google.checkStatus}>
            Conferir configuração
          </button>
        )}
      </div>
      <small>
        A leitura substitui a base {operational ? 'do Operacional' : 'de OS'} da sessão após a
        validação. Os filtros são preservados nas próximas atualizações do Google. Fechar este
        quadro não pausa a atualização; desmarque a opção acima para pausar. Importar um arquivo
        local desliga a conexão automática.
      </small>
      {google.error && (
        <p role="alert" className="error">
          {google.error}
        </p>
      )}
    </section>
  );
}
