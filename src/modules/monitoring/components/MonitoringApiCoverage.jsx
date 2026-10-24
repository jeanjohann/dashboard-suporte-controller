import React from 'react';
import { monitoringDate } from '../domain/monitoring.js';
/** Mostra somente campos efetivamente preservados na fotografia recebida. */
export function MonitoringApiCoverage({ source }) {
  if (!source || source.demonstration) return null;
  const fields = [
    ['Prefixo', 'prefix'],
    ['ICCID', 'iccid'],
    ['MSISDN', 'msisdn'],
  ];
  return (
    <details className="panel monitoring-api-coverage">
      <summary>Campos disponíveis da API · {source.vehicles.length} veículos</summary>
      <p className="scope">
        Fotografia de {monitoringDate(source.referenceAt)}. Cobertura informa recebimento do campo,
        não valida a exatidão do cadastro.
      </p>
      <ul>
        {fields.map(([label, key]) => (
          <li key={key}>
            {label}:{' '}
            {
              source.vehicles.filter((row) => typeof row[key] === 'string' && row[key].trim())
                .length
            }{' '}
            de {source.vehicles.length} registros.
          </li>
        ))}
      </ul>
      <p className="scope">
        Consumo da linha não faz parte do contrato integrado atual. Para incluir um endpoint,
        precisamos de ICCID/MSISDN, volume com unidade, início/fim do acumulado e instante de
        apuração. Posições de rastreamento não são convertidas em consumo de dados.
      </p>
    </details>
  );
}
