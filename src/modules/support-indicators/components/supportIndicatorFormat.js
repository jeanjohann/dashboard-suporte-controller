import { duration } from '../domain/indicators.js';

export const number = (value) => (value == null ? 'Sem dados' : value.toLocaleString('pt-BR'));
export const date = (value) => (value ? value.split('-').reverse().join('/') : '—');
export const timestamp = (value) =>
  new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
export const format = (key, value) => (key === 'seconds' ? duration(value) : number(value));
