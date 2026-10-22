/** Consulta manual KORE restrita a administradores; uma página isolada, sem gravar ou combinar dados com CSV. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Section } from '../../../components/Section.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { PermissionButton, useAccess } from '../../../shared/security/Access.jsx';
import { download, csv } from '../../../shared/export/exports.js';
import { korePageSummary } from '../data/koreContract.js';
import { appendKoreBatch } from '../data/koreCollection.js';
import { linkConsumption } from '../domain/lineConsumption.js';
import { koreMegabytes, formatKoreMegabytes } from '../domain/koreDisplay.js';

const show = (value) => (value == null || value === '' ? 'Não informado' : value);
const yes = (value) => (value == null ? 'Não informado' : value ? 'Sim' : 'Não');

export function KorePilotPanel({ visible, operational }) {
  const { user } = useAccess();
  const allowed = user?.role === 'admin';
  const [status, setStatus] = useState(null),
    [page, setPage] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [automatic, setAutomatic] = useState(false),
    [viewPage, setViewPage] = useState(1);
  const request = useRef(null),
    retryAt = useRef(0);
  useEffect(() => {
    if (!visible || !allowed) return;
    const controller = new AbortController();
    fetch('/api/consumption/kore/status', {
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json'))
          throw Error('status');
        const next = await response.json();
        if (typeof next.configured !== 'boolean') throw Error('status');
        setStatus(next);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError('Não foi possível conferir a configuração da KORE.');
      });
    return () => controller.abort();
  }, [visible, allowed]);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (!remaining) return;
    const timer = setInterval(
      () => setRemaining(Math.max(0, Math.ceil((retryAt.current - Date.now()) / 1000))),
      1000,
    );
    return () => clearInterval(timer);
  }, [remaining > 0]);
  useEffect(() => {
    if (
      visible &&
      automatic &&
      !busy &&
      !error &&
      !remaining &&
      page?.hasNext &&
      page.cleanupConfirmed
    )
      read(page.page + 1);
  }, [visible, automatic, busy, error, remaining, page]);
  async function read(number = 1) {
    if (request.current || Date.now() < retryAt.current) return;
    const controller = new AbortController();
    request.current = controller;
    retryAt.current = Date.now() + 600000;
    setRemaining(600);
    setBusy(true);
    setError('');
    const timer = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch(`/api/consumption/kore/batch?pagina=${number}`, {
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        signal: controller.signal,
      });
      if (!response.ok) {
        const messages = {
          401: 'Entre novamente no sistema para consultar a KORE.',
          403: 'O piloto KORE está disponível somente para administradores.',
          429: 'Aguarde antes de repetir a consulta à KORE.',
          503: 'As credenciais KORE ainda não estão configuradas.',
        };
        if (messages[response.status]) throw Error(messages[response.status]);
        if (
          response.status === 502 &&
          response.headers.get('Content-Type')?.includes('application/json')
        ) {
          const failure = await response.json();
          const reasons = {
            kore_token_wait:
              'A KORE exige aguardar 10 minutos antes de gerar um novo token. Tente novamente após esse intervalo.',
            kore_active_token:
              'Já existe um token ativo para esta conta KORE. O administrador precisa encerrar o token anterior antes de uma nova consulta.',
            kore_authentication: 'A KORE não autorizou a autenticação desta consulta.',
            kore_reading: 'Não foi possível consultar esta página da KORE.',
            kore_contract: 'A KORE retornou uma página incompatível ou incompleta.',
            kore_cleanup: 'A KORE não confirmou o encerramento do token desta consulta.',
          };
          if (failure.code === 'kore_token_wait') {
            retryAt.current = Date.now() + 600000;
            setRemaining(600);
          }
          if (reasons[failure.code]) throw Error(reasons[failure.code]);
        }
        throw Error(
          'Não foi possível obter uma página válida da KORE. Confira autenticação, liberação de rede e disponibilidade com o administrador.',
        );
      }
      if (!response.headers.get('Content-Type')?.includes('application/json'))
        throw Error('A KORE não retornou uma página válida.');
      const next = appendKoreBatch(number === 1 ? null : page, await response.json());
      setPage(next);
      if (number === 1) setViewPage(1);
      if (next.complete || !next.cleanupConfirmed) setAutomatic(false);
    } catch (failure) {
      setAutomatic(false);
      if (!controller.signal.aborted) setError(failure.message);
      else setError('A consulta ultrapassou o tempo de espera.');
    } finally {
      clearTimeout(timer);
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  const summary = page ? korePageSummary(page) : null;
  const linkedRows = useMemo(
    () => linkConsumption(page?.rows ?? [], operational),
    [page, operational],
  );
  function exportPage() {
    const header = [
      'Fonte',
      'Consulta UTC',
      'Páginas coletadas',
      'Início da coleta UTC',
      'Cobertura',
      'Total informado na conta',
      'Período do consumo',
      'ICCID',
      'MSISDN',
      'ID KORE',
      'Operadora',
      'Situação',
      'Conexão informada',
      'Último acesso (BRT; UTC-03:00)',
      'Consumo informado (bytes)',
      'Consumo informado (MB; 1 MB = 1000000 bytes)',
      'Cliente no Operacional',
      'Serial no Operacional',
      'Modelo por serial',
      'Conferência do vínculo',
      'Dados aprovisionados',
      'Dados bloqueados',
      'Bloqueio funcional',
      'Bloqueio administrativo',
      'Suspensa',
      'APN',
      'Tecnologia',
    ];
    const rows = linkedRows.map((row) => [
      'KORE/Saitro',
      page.readAt,
      page.page,
      page.firstReadAt,
      page.complete ? 'Completa' : 'Parcial',
      page.totalReported,
      'Não confirmado',
      row.iccid ?? '',
      row.number ?? '',
      row.id,
      row.operator ?? '',
      row.status ?? '',
      row.connection ?? '',
      row.lastAccess ?? '',
      row.bytes ?? '',
      koreMegabytes(row.bytes) ?? '',
      row.client,
      row.serial,
      row.model,
      row.linkState,
      yes(row.dataProvisioned),
      yes(row.dataBlocked),
      yes(row.functionalBlock),
      yes(row.administrativeBlock),
      yes(row.suspended),
      row.apn ?? '',
      row.technology ?? '',
    ]);
    download(
      csv([header, ...rows]),
      'text/csv;charset=utf-8',
      `kore-coleta-${page.complete ? 'completa' : 'parcial'}.csv`,
    );
  }
  return (
    <Section
      title="KORE · consulta de linhas"
      visible={visible}
      help="Coleta iniciada manualmente, para administradores. Cada lote consulta até oito páginas com um token e tenta encerrá-lo ao final. Lotes seguintes aguardam dez minutos e continuam enquanto esta página estiver aberta, sem erro e com continuação habilitada. Dados ficam apenas na memória desta sessão; recarregar perde o progresso. A coleta abrange vários instantes, não é uma fotografia simultânea. Consumo em bytes, horários BRT, período do acumulado ainda não confirmado. Não altera indicadores CSV."
      summary={
        <ReportSummary
          metrics={[
            [
              'Situação',
              page
                ? page.complete
                  ? 'Coleta completa'
                  : 'Coleta parcial'
                : status?.configured
                  ? 'Configurada'
                  : 'Aguardando configuração',
            ],
            ['Linhas coletadas', page?.rows.length ?? '—'],
            ['Linhas informadas na conta', page?.totalReported ?? '—'],
          ]}
          note="Fonte separada dos extratos CSV; período do acumulado ainda não confirmado."
        />
      }
    >
      {!allowed ? (
        <p className="scope">O piloto KORE está disponível somente para administradores.</p>
      ) : (
        <>
          <p className="notice">
            Consumo em MB (1 MB = 1.000.000 bytes) e horários em BRT (UTC-03:00). Sessões abertas
            podem levar de 5 minutos a 1 hora para atualizar, conforme a operadora. O período do
            acumulado ainda precisa de confirmação; estes valores permanecem separados dos
            indicadores dos CSVs.
          </p>
          <p className="scope">
            {operational?.data?.rows || operational?.rows
              ? `Referência: ${operational.filename || 'Operacional carregado na sessão'}.`
              : 'Carregue o Operacional para conferir clientes e equipamentos.'}{' '}
            O vínculo exige ICCID e número correspondendo ao mesmo cadastro único. Cadastro atual
            não comprova titularidade histórica.
          </p>
          <div className="integration-preview-controls" data-no-print>
            <button
              disabled={!status?.configured || busy || remaining > 0}
              onClick={() => {
                setAutomatic(true);
                read(page?.hasNext ? page.page + 1 : 1);
              }}
            >
              {busy
                ? 'Consultando KORE…'
                : remaining > 0
                  ? `Aguarde ${remaining} s`
                  : page
                    ? page.hasNext
                      ? 'Continuar coleta KORE'
                      : 'Atualizar todas as linhas'
                    : 'Coletar todas as linhas KORE'}
            </button>
            {page && (
              <>
                <button disabled={viewPage <= 1} onClick={() => setViewPage(viewPage - 1)}>
                  Página anterior
                </button>
                <button
                  disabled={viewPage * 20 >= page.rows.length}
                  onClick={() => setViewPage(viewPage + 1)}
                >
                  Próxima página
                </button>
                <PermissionButton action="export" onClick={exportPage}>
                  Exportar linhas coletadas CSV
                </PermissionButton>
                {page.hasNext && (
                  <button
                    disabled={busy || remaining > 0}
                    onClick={() => {
                      setAutomatic(true);
                      read(1);
                    }}
                  >
                    Reiniciar coleta
                  </button>
                )}
              </>
            )}
          </div>
          <p className="scope">
            Cada lote consulta até oito páginas. A próxima coleta aguarda dez minutos. Dados e
            progresso ficam apenas nesta sessão; recarregar a página reinicia a coleta.
          </p>
          {page?.hasNext && (
            <p className="scope" role="status">
              {page.rows.length} de {page.totalReported} linhas coletadas · {page.page} páginas.
              {automatic
                ? ' Continuação automática habilitada; mantenha esta página aberta.'
                : ' Continuação pausada.'}
              <button
                type="button"
                onClick={() => setAutomatic(!automatic)}
                disabled={busy || !!error || !page.cleanupConfirmed}
              >
                {automatic ? 'Pausar continuação' : 'Habilitar continuação'}
              </button>
            </p>
          )}
          {status && !status.configured && (
            <p className="scope">Acesso KORE ainda não configurado no servidor.</p>
          )}
          {error && (
            <p role="alert" className="notice">
              {error} {page ? 'A última página válida foi mantida e pode estar desatualizada.' : ''}
            </p>
          )}
          {page && (
            <>
              {!page.cleanupConfirmed && (
                <p role="status" className="notice">
                  Os dados foram recebidos e validados. A KORE não confirmou o encerramento do token
                  no formato esperado; o administrador deve conferir essa pendência antes de uma
                  nova consulta.
                </p>
              )}
              <p className="scope">
                Leitura bem-sucedida:{' '}
                {new Date(page.readAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}{' '}
                (Brasília). {page.rows.length} linhas de {page.totalReported} informadas na conta ·{' '}
                {page.page} páginas coletadas.{' '}
                {page.hasNext
                  ? 'Há outras páginas ainda não coletadas.'
                  : 'Coleta completa: todas as páginas e a quantidade de linhas foram conferidas.'}{' '}
                Início:{' '}
                {new Date(page.firstReadAt).toLocaleString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                })}{' '}
                (Brasília).
              </p>
              <ReportSummary
                metrics={[
                  [
                    page.complete
                      ? 'Total informado nas linhas coletadas'
                      : 'Subtotal da coleta parcial',
                    formatKoreMegabytes(summary.bytes),
                  ],
                  ['Linhas com bytes informados', `${summary.known} de ${summary.rows}`],
                  [
                    'Vínculos confirmados no Operacional',
                    `${linkedRows.filter((row) => row.link).length} de ${summary.rows}`,
                  ],
                ]}
                note="Acumulado de período não confirmado; não equivale a consumo diário ou mensal. Ausência não é zero."
              />
              <div className="table-scroll">
                <SortableTable>
                  <thead>
                    <tr>
                      {[
                        'ICCID',
                        'MSISDN',
                        'Cliente · Operacional',
                        'Serial',
                        'Modelo por serial',
                        'Conferência do vínculo',
                        'Operadora',
                        'Situação',
                        'Conexão informada',
                        'Consumo informado · MB',
                        'Último acesso · BRT',
                        'Dados bloqueados',
                        'Suspensa',
                        'APN',
                      ].map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {linkedRows.slice((viewPage - 1) * 20, viewPage * 20).map((row) => (
                      <tr key={row.id}>
                        <td>{show(row.iccid)}</td>
                        <td>{show(row.number)}</td>
                        <td>{row.client}</td>
                        <td>{row.serial}</td>
                        <td>{row.model}</td>
                        <td>{row.linkState}</td>
                        <td>{show(row.operator)}</td>
                        <td>{show(row.status)}</td>
                        <td>{show(row.connection)}</td>
                        <td data-sort={row.bytes}>{formatKoreMegabytes(row.bytes)}</td>
                        <td>{show(row.lastAccess)}</td>
                        <td>{yes(row.dataBlocked)}</td>
                        <td>{yes(row.suspended)}</td>
                        <td>{show(row.apn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </div>
            </>
          )}
        </>
      )}
    </Section>
  );
}
