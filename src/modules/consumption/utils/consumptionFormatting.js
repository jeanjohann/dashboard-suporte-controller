/** Apresentação local do consumo, independente de React e do armazenamento. Não arredonda os dados de origem. */
import { VOLUME_SCALE } from '../domain/lineConsumption.js';

/** Recebe MB; mantém até seis casas na apresentação e ausência como traço. */
export const formatMB = (value) =>
  value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 6 }) + ' MB';
/** Recebe ticks inteiros da unidade interna do consumo. */
export const formatVolume = (value) => formatMB(value == null ? null : value / VOLUME_SCALE);
export const formatNumber = (value) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
/** Recebe centavos, mantendo zero distinto de valor não informado. */
export const formatCurrency = (value) =>
  value == null
    ? 'Não informado'
    : (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
/** Data da ação no fuso de São Paulo, sem usar a data UTC como padrão do formulário. */
export const currentDate = () => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  return ['year', 'month', 'day']
    .map((key) => parts.find((part) => part.type === key).value)
    .join('-');
};
