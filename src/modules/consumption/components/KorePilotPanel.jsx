/** Consulta manual KORE restrita a administradores; uma página isolada, sem gravar ou combinar dados com CSV. */
import React, { useEffect, useRef, useState } from 'react';
import { Section } from '../../../components/Section.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { PermissionButton, useAccess } from '../../../shared/security/Access.jsx';
import { download, csv } from '../../../shared/export/exports.js';
import { normalizeKorePage, korePageSummary } from '../data/koreContract.js';

const show = (value) => (value == null || value === '' ? 'Não informado' : value);
const bytes = (value) =>
  value == null ? 'Não informado' : value.toLocaleString('pt-BR') + ' bytes';
const yes = (value) => (value == null ? 'Não informado' : value ? 'Sim' : 'Não');

export function KorePilotPanel({ visible }) {
  const { user } = useAccess();
  const allowed = user?.role === 'admin';
  const [status, setStatus] = useState(null),
    [page, setPage] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [remaining, setRemaining] = useState(0);
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
  async function read(number = 1) {
    if (request.current || Date.now() < retryAt.current) return;
    const controller = new AbortController();
    request.current = controller;
    retryAt.current = Date.now() + 60000;
    setRemaining(60);
    setBusy(true);
    setError('');
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`/api/consumption/kore/page?pagina=${number}`, {
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        signal: controller.signal,
      });
      if (!response.ok) {
        const messages = {
          401: 'Entre novamente no sistema para consultar a KORE.',
          403: 'O piloto KORE está disponível somente para administradores.',
          429: 'Aguarde um minuto entre consultas à KORE.',
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
      const next = normalizeKorePage(await response.json());
      if (next.page !== number) throw Error('A página recebida não corresponde à solicitada.');
      setPage(next);
    } catch (failure) {
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
  function exportPage() {
    const header = [
      'Fonte',
      'Consulta UTC',
      'Página',
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
      'Dados aprovisionados',
      'Dados bloqueados',
      'Bloqueio funcional',
      'Bloqueio administrativo',
      'Suspensa',
      'APN',
      'Tecnologia',
    ];
    const rows = page.rows.map((row) => [
      'KORE/Saitro',
      page.readAt,
      page.page,
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
      yes(row.dataProvisioned),
      yes(row.dataBlocked),
      yes(row.functionalBlock),
      yes(row.administrativeBlock),
      yes(row.suspended),
      row.apn ?? '',
      row.technology ?? '',
    ]);
    download(csv([header, ...rows]), 'text/csv;charset=utf-8', `kore-pagina-${page.page}.csv`);
  }
  return (
    <Section
      title="KORE · consulta de linhas"
      visible={visible}
      help="Piloto manual, somente para administradores. Uma página por leitura; a quantidade total da conta não é a quantidade coletada. Autenticação e encerramento do token usado nesta consulta ocorrem somente no servidor. Consumo em bytes é o acumulado informado pela KORE, ainda sem período/ciclo confirmado. Último acesso é mostrado em BRT (UTC-03:00), conforme confirmação da operadora. A consulta lê o banco da KORE no momento do pedido; sessões abertas dependem das atualizações das operadoras, de 5 minutos a 1 hora. A consulta não modifica os indicadores CSV. Sem atualização automática."
      summary={
        <ReportSummary
          metrics={[
            [
              'Situação',
              page
                ? 'Leitura confirmada'
                : status?.configured
                  ? 'Configurada'
                  : 'Aguardando configuração',
            ],
            ['Linhas desta página', page?.rows.length ?? '—'],
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
            Consumo em bytes e horários em BRT (UTC-03:00). Sessões abertas podem levar de 5 minutos
            a 1 hora para atualizar, conforme a operadora. O período do acumulado ainda precisa de
            confirmação; estes valores permanecem separados dos indicadores dos CSVs.
          </p>
          <div className="integration-preview-controls" data-no-print>
            <button
              disabled={!status?.configured || busy || remaining > 0}
              onClick={() => read(page?.page ?? 1)}
            >
              {busy
                ? 'Consultando KORE…'
                : remaining > 0
                  ? `Aguarde ${remaining} s`
                  : page
                    ? 'Atualizar página KORE'
                    : 'Consultar linhas KORE'}
            </button>
            {page && (
              <>
                <button
                  disabled={busy || remaining > 0 || page.page <= 1}
                  onClick={() => read(page.page - 1)}
                >
                  Página anterior
                </button>
                <button
                  disabled={busy || remaining > 0 || !page.hasNext}
                  onClick={() => read(page.page + 1)}
                >
                  Próxima página
                </button>
                <PermissionButton action="export" onClick={exportPage}>
                  Exportar página CSV
                </PermissionButton>
              </>
            )}
          </div>
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
              <p className="scope">
                Leitura bem-sucedida:{' '}
                {new Date(page.readAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}{' '}
                (Brasília). Página {page.page}: {page.rows.length} linhas de {page.totalReported}{' '}
                informadas na conta.{' '}
                {page.hasNext
                  ? 'Há outras páginas ainda não coletadas.'
                  : 'Fim da paginação informado nesta consulta; páginas anteriores não são acumuladas neste painel.'}
              </p>
              <ReportSummary
                metrics={[
                  ['Subtotal desta página', bytes(summary.bytes)],
                  ['Linhas com bytes informados', `${summary.known} de ${summary.rows}`],
                ]}
                note="Acumulado de período não confirmado; não é consumo diário, mensal ou total da conta. Ausência não é zero."
              />
              <div className="table-scroll">
                <SortableTable>
                  <thead>
                    <tr>
                      {[
                        'ICCID',
                        'MSISDN',
                        'Operadora',
                        'Situação',
                        'Conexão informada',
                        'Consumo informado · bytes',
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
                    {page.rows.map((row) => (
                      <tr key={row.id}>
                        <td>{show(row.iccid)}</td>
                        <td>{show(row.number)}</td>
                        <td>{show(row.operator)}</td>
                        <td>{show(row.status)}</td>
                        <td>{show(row.connection)}</td>
                        <td data-sort={row.bytes}>{bytes(row.bytes)}</td>
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
