/** Cabeçalho e seletores de arquivo do consumo; ações e referências são fornecidas pelo controlador. */
import React from 'react';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { PageSettingsButton } from '../../../components/PageSettings.jsx';
export function ConsumptionImportHeader({
  busy,
  ready,
  imports,
  settingsAvailable,
  operator = '',
  title = 'Relatórios de consumo',
}) {
  const { input, operationalInput, backupInput, load, loadOperational, readBackup } = imports;
  return (
    <header>
      <div>
        <div className="eyebrow">CONTROLE DE LINHAS</div>
        <h1>{operator || title}</h1>
        <p>
          {operator
            ? `${operator === 'Kore' ? 'API e extratos KORE' : 'Extratos manuais Arqia'} · histórico e backup por operadora.`
            : 'KORE e Arqia · fontes identificadas, apurações e vínculos preservados.'}
        </p>
      </div>
      <div className="line-actions">
        {operator && (
          <PermissionButton
            className="primary-action"
            action="import"
            disabled={busy || !ready}
            onClick={() => input.current.click()}
          >
            Importar extratos
          </PermissionButton>
        )}
        <PageSettingsButton
          available={settingsAvailable}
          help={
            operator
              ? `${operator} tem importação, filtros e histórico separados da outra operadora. O sistema não presume ciclo de consumo nem franquia individual; confira a referência do arquivo ou da API.`
              : 'KORE e Arqia mantêm fontes e consumos separados. A página de acompanhamento e os relatórios combinados permitem comparar as operadoras sem somar linhas ou ciclos incompatíveis.'
          }
        />
      </div>
      <input hidden ref={input} type="file" accept=".csv,text/csv" multiple onChange={load} />
      <input
        hidden
        ref={operationalInput}
        type="file"
        accept=".xlsx,.xls"
        onChange={loadOperational}
      />
      <input
        hidden
        ref={backupInput}
        type="file"
        accept=".json,application/json"
        onChange={readBackup}
      />
    </header>
  );
}
