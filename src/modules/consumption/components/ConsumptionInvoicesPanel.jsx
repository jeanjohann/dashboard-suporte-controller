/** Relatórios de consumo por assunto. Recebem o recorte e preservam o domínio e contexto de impressão da página. */
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { formatCurrency as currency } from '../utils/consumptionFormatting.js';
const sumMoney = (rows, key) => {
  const values = rows.map((row) => row[key]).filter((value) => value != null);
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
};

export function ConsumptionInvoicesPanel({
  shown,
  hasStatements,
  providerStats,
  invoiceRows,
  fees,
}) {
  return (
    <>
      <Section
        title="Mensalidades dos extratos"
        visible={shown('Mensalidades dos extratos') && hasStatements}
        defaultOpen={false}
      >
        <InfoNote>
          Valores da Kore separados por serviço. Arqia não informa preços neste formato. Valor
          Faturado e Valor Total são os campos do extrato; não confirmam pagamento. Frete permanece
          separado e sem rateio por chip.
        </InfoNote>
        <div className="table-scroll">
          <SortableTable>
            <thead>
              <tr>
                {[
                  'Operadora',
                  'Serviço',
                  'Registros',
                  'Valor Faturado',
                  'Valor Multa',
                  'Valor Total',
                  'Valores totais válidos',
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providerStats.flatMap(({ operator }) =>
                ['dados', 'sms'].map((service) => {
                  const records = invoiceRows.filter(
                    (row) => row.operator === operator && row.service === service,
                  );
                  return (
                    <tr key={operator + service}>
                      <td>{operator}</td>
                      <td>{service === 'dados' ? 'Dados móveis' : 'SMS'}</td>
                      <td>{records.length}</td>
                      <td data-sort={sumMoney(records, 'billedCents')}>
                        {currency(sumMoney(records, 'billedCents'))}
                      </td>
                      <td data-sort={sumMoney(records, 'penaltyCents')}>
                        {currency(sumMoney(records, 'penaltyCents'))}
                      </td>
                      <td data-sort={sumMoney(records, 'totalCents')}>
                        {currency(sumMoney(records, 'totalCents'))}
                      </td>
                      <td>
                        {records.filter((row) => row.totalCents != null).length} / {records.length}
                      </td>
                    </tr>
                  );
                }),
              )}
              {providerStats.map(({ operator }) => {
                const records = fees.filter((row) => row.operator === operator);
                return (
                  <tr key={operator + 'fees'}>
                    <td>{operator}</td>
                    <td>Outros serviços dos extratos completos</td>
                    <td>{records.length}</td>
                    <td>{currency(sumMoney(records, 'billedCents'))}</td>
                    <td>{currency(sumMoney(records, 'penaltyCents'))}</td>
                    <td>{currency(sumMoney(records, 'totalCents'))}</td>
                    <td>
                      {records.filter((row) => row.totalCents != null).length} / {records.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </SortableTable>
        </div>
      </Section>
    </>
  );
}
