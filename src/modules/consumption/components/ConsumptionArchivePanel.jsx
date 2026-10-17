/** Gestão visual de arquivos e backups. As ações são autorizadas e persistidas pelo coordenador da página. */
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { importLineStatement } from '../domain/lineConsumption.js';
export function ConsumptionArchivePanel({
  visible,
  archive,
  operational,
  ready,
  busy,
  backup,
  onExport,
  onReview,
  onRestore,
  onCancel,
  onSaveOperational,
  onChangeVersion,
}) {
  return (
    <Section
      title="Arquivos e histórico"
      visible={visible}
      summary={
        <ReportSummary
          metrics={[
            ['Arquivos guardados', archive.files.length],
            ['Versões em uso', archive.files.filter((file) => file.active !== false).length],
            ['Anotações salvas', archive.notes.length],
            ['Referência operacional', archive.operational?.filename || 'Não guardada'],
          ]}
          note="Histórico local completo deste navegador, independente dos filtros de consumo. Não há sincronização entre usuários; o backup mantém versões e anotações."
        />
      }
    >
      <p className="scope">
        Os arquivos originais, a referência operacional e as anotações ficam neste navegador e
        endereço do dashboard. Exporte um backup para levar a outro computador ou proteger o
        histórico. Uma nova versão do mesmo período arquiva a anterior, sem apagá-la.
      </p>
      <div className="line-actions">
        <PermissionButton action="export" disabled={busy || !ready} onClick={onExport}>
          Baixar backup do histórico
        </PermissionButton>
        <PermissionButton action="import" disabled={busy || !ready} onClick={onReview}>
          Revisar backup para restaurar
        </PermissionButton>
        {operational?.data && (
          <button disabled={busy} onClick={onSaveOperational}>
            Guardar operacional atual no histórico
          </button>
        )}
      </div>
      {backup && (
        <div className="notice">
          <strong>
            Backup conferido: {backup.files.length} arquivos e {backup.notes.length} anotações.
          </strong>
          <p>
            A restauração substitui o histórico deste navegador. Baixe o backup atual antes de
            prosseguir, se quiser preservá-lo.
          </p>
          <div className="line-actions">
            <PermissionButton action="import" disabled={busy} onClick={onRestore}>
              Restaurar substituindo o histórico atual
            </PermissionButton>
            <button disabled={busy} onClick={onCancel}>
              Cancelar restauração
            </button>
          </div>
        </div>
      )}
      <div className="table-scroll">
        <SortableTable>
          <thead>
            <tr>
              {['Arquivo', 'Operadora', 'Apuração', 'Registros', 'Versão', 'Ação'].map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {archive.files.map((file) => {
              const parsed = importLineStatement(file.text, file.filename, file.id);
              return (
                <tr key={file.id}>
                  <td>{file.filename}</td>
                  <td>{parsed.operator}</td>
                  <td>{parsed.periods.map((period) => period.label).join(' / ')}</td>
                  <td>{parsed.rows.length}</td>
                  <td>{file.active === false ? 'Arquivada' : 'Em uso'}</td>
                  <td>
                    <button disabled={busy} onClick={() => onChangeVersion(file)}>
                      {file.active === false ? 'Reativar versão' : 'Arquivar versão'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </SortableTable>
      </div>
    </Section>
  );
}
