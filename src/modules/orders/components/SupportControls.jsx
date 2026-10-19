/** Um único recorte: os controles escrevem nos mesmos filtros da categoria. */
import React, { useState } from 'react';
import { supportPeriod, supportRoles } from '../domain/supportPerformance.js';

const presets = [
  ['last7', 'Últimos 7 dias'],
  ['previousWeek', 'Semana anterior'],
  ['month', 'Mês'],
  ['year', 'Ano'],
  ['total', 'Todo o histórico'],
];
const day = (value, fallback) => (value ? value.split('-').reverse().join('/') : fallback);

export function SupportControls({ role, setRole, filters, setFilters, today }) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [year, setYear] = useState(today.slice(0, 4));
  const [custom, setCustom] = useState(false);
  const [choice, setChoice] = useState(null);
  const validMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
  const validYear = /^\d{4}$/.test(year) && Number(year) >= 1900;
  const choiceMatches =
    choice && choice.start === (filters.start || '') && choice.end === (filters.end || '');
  const preset = custom
    ? 'custom'
    : choiceMatches
      ? choice.key
      : presets.find(([key]) => {
          if ((key === 'month' && !validMonth) || (key === 'year' && !validYear)) return false;
          const range = supportPeriod(key, today, month, year);
          return (
            (range.start || '') === (filters.start || '') &&
            (range.end || '') === (filters.end || '')
          );
        })?.[0] || 'custom';
  const apply = (key, nextMonth = month, nextYear = year) => {
    const range = supportPeriod(key, today, nextMonth, nextYear);
    setChoice({ key, ...range });
    setFilters((previous) => ({
      ...previous,
      ...range,
    }));
  };
  return (
    <div className="support-toolbar">
      <div className="support-source-heading">
        <span className="support-source-tag">ORDENS DE SERVIÇO</span>
        <p>Serviços realizados pela equipe</p>
      </div>
      <div className="support-controls" data-no-print>
        <label>
          Responsabilidade
          <select
            aria-label="Responsabilidade"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {Object.entries(supportRoles).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
            <option value="both">Ambos</option>
          </select>
        </label>
        <label>
          Período das OS
          <select
            aria-label="Período das OS"
            value={preset}
            onChange={(e) => {
              setCustom(e.target.value === 'custom');
              if (e.target.value !== 'custom') {
                const nextMonth = validMonth ? month : today.slice(0, 7);
                const nextYear = validYear ? year : today.slice(0, 4);
                setMonth(nextMonth);
                setYear(nextYear);
                apply(e.target.value, nextMonth, nextYear);
              }
            }}
          >
            {presets.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
            <option value="custom">Personalizado</option>
          </select>
        </label>
        {preset === 'month' && (
          <label>
            Mês de referência
            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                if (/^\d{4}-(0[1-9]|1[0-2])$/.test(e.target.value)) apply('month', e.target.value);
              }}
            />
          </label>
        )}
        {preset === 'year' && (
          <label>
            Ano de referência
            <input
              type="number"
              min="1900"
              max="9999"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                if (/^\d{4}$/.test(e.target.value) && Number(e.target.value) >= 1900)
                  apply('year', month, e.target.value);
              }}
            />
          </label>
        )}
        {preset === 'custom' && (
          <>
            <label>
              De
              <input
                type="date"
                aria-label="Início do período das OS"
                value={filters.start || ''}
                onChange={(e) => setFilters((previous) => ({ ...previous, start: e.target.value }))}
              />
            </label>
            <label>
              Até
              <input
                type="date"
                aria-label="Fim do período das OS"
                value={filters.end || ''}
                onChange={(e) => setFilters((previous) => ({ ...previous, end: e.target.value }))}
              />
            </label>
          </>
        )}
      </div>
      <p className="support-period-caption">
        {day(filters.start, 'Início do histórico')} — {day(filters.end, 'fim do histórico')}
        <span>Somente serviços Concluída/Pago · filtros próprios das OS</span>
      </p>
    </div>
  );
}
