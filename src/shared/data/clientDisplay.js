/** Somente apresentação: não altera identidade, agrupamentos, comparação ou dados de origem. */
export const clientDisplay = (value) => String(value ?? '').toLocaleUpperCase('pt-BR');
