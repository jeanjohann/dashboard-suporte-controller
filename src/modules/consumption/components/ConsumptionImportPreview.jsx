/** Prévia revisável dos extratos; gravação e cancelamento permanecem explícitos. */
import React from 'react';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { importLineStatement, statementSignature } from '../domain/lineConsumption.js';
export function ConsumptionImportPreview({ pending, archive, busy, savePending, setPending }) {
  return (
    <>
      {!!pending.length && (
        <section className="panel line-import-preview">
          <h2>Conferir importação</h2>
          {pending.map(({ file, parsed }) => (
            <div key={file.id}>
              <strong>
                {file.filename} · {parsed.operator}
              </strong>
              <p>
                {parsed.rows.filter((row) => row.service === 'dados').length} registros de dados ·{' '}
                {parsed.rows.filter((row) => row.service === 'sms').length} de SMS ·{' '}
                {parsed.rows.filter((row) => !['dados', 'sms'].includes(row.service)).length} de
                outros serviços
              </p>
              <p className="scope">
                {parsed.periods.map((period) => period.label).join(' / ')} ·{' '}
                {parsed.rows.filter((row) => row.problems.length).length} registros para revisão.{' '}
                {archive.files.some((old) => old.id === file.id)
                  ? 'Este arquivo já está no histórico; não será somado novamente.'
                  : archive.files.some(
                        (old) =>
                          old.active !== false &&
                          statementSignature(
                            importLineStatement(old.text, old.filename, old.id),
                          ) === statementSignature(parsed),
                      )
                    ? 'A versão anterior desta apuração será arquivada e preservada.'
                    : 'Nova apuração no histórico.'}
              </p>
            </div>
          ))}
          <div className="line-actions">
            <PermissionButton action="import" disabled={busy} onClick={savePending}>
              Salvar no histórico
            </PermissionButton>
            <button disabled={busy} onClick={() => setPending([])}>
              Cancelar importação
            </button>
          </div>
        </section>
      )}
    </>
  );
}
