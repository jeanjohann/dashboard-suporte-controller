/** Gráficos dos dois papéis: barras por pessoa e evolução com datas independentes. */
import React, { useRef, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { chartSvg, download } from '../../../shared/export/exports.js';
import { supportSeries } from '../domain/supportComparison.js';

const color = (key) => `var(--chart-${key === 'scheduling' ? 'main' : 'secondary'})`;
const colors = () =>
  Object.fromEntries(
    supportSeries.map(({ key }) => [
      key,
      getComputedStyle(document.documentElement)
        .getPropertyValue(key === 'scheduling' ? '--chart-main' : '--chart-secondary')
        .trim(),
    ]),
  );

/** O limite se refere a pessoas, preservando as duas barras de cada nome. */
export function SupportComparisonBars({ items, note }) {
  const [limit, setLimit] = useState('10');
  const shown = limit === 'all' ? items : items.slice(0, Number(limit));
  const max = Math.max(1, ...shown.flatMap((item) => supportSeries.map(({ key }) => item[key])));
  const exportChart = () => {
    const palette = colors();
    return download(
      chartSvg(
        shown.flatMap((item) =>
          supportSeries.map(({ key, label }) => ({
            label: `${item.label} · ${label}`,
            value: item[key],
            color: palette[key],
          })),
        ),
        {
          title: 'Equipe de suporte · Agendamentos e execuções',
          subtitle: `${shown.length} de ${items.length} pessoas`,
          note,
          format: (value) => value.toLocaleString('pt-BR'),
        },
      ),
      'image/svg+xml',
      'equipe-suporte-ambos.svg',
    );
  };
  return (
    <div className="support-comparison">
      <div className="chart-heading">
        <h3>Volume por responsável · Ambos</h3>
        <label>
          Participantes no gráfico{' '}
          <select
            aria-label="Participantes no gráfico"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
          >
            <option value="10">10 maiores</option>
            <option value="20">20 maiores</option>
            <option value="all">Todos</option>
          </select>
        </label>
      </div>
      <p className="scope">
        {shown.length} de {items.length} pessoas. Ordem pelo maior valor de cada pessoa entre os
        dois papéis, sem somá-los. Tabela e totais permanecem completos.
      </p>
      <PermissionButton action="export" disabled={!shown.length} onClick={exportChart}>
        Baixar este gráfico SVG
      </PermissionButton>
      {!items.length && <p className="scope">Sem responsáveis válidos para esta seleção.</p>}
      <div className="support-comparison-rows">
        {shown.map((item) => (
          <div className="support-comparison-row" key={item.label}>
            <span className="bar-name" title={item.label}>
              {item.label}
            </span>
            <div className="support-comparison-values">
              {supportSeries.map(({ key, label }) => (
                <div className="support-comparison-series" key={key}>
                  <span>{label}</span>
                  <div className="readable-track" aria-hidden="true">
                    <div style={{ width: `${(item[key] / max) * 100}%`, background: color(key) }} />
                  </div>
                  <strong>{item[key].toLocaleString('pt-BR')}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Somente períodos observados; ausência de registro num papel é null, sem inventar ponto zero. */
export function SupportComparisonEvolution({ items }) {
  const container = useRef();
  const exportChart = () => {
    const source = container.current?.querySelector('svg.recharts-surface');
    if (!source) return;
    const copy = source.cloneNode(true),
      palette = colors();
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copy.style.setProperty('--chart-main', palette.scheduling);
    copy.style.setProperty('--chart-secondary', palette.execution);
    copy.style.setProperty(
      '--ui-muted',
      getComputedStyle(document.documentElement).getPropertyValue('--ui-muted'),
    );
    copy.style.setProperty(
      '--ui-line',
      getComputedStyle(document.documentElement).getPropertyValue('--ui-line'),
    );
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = 'Evolução de atendimentos efetivos · Agendamentos e execuções';
    copy.prepend(title);
    // A legenda do Recharts é HTML; incluir uma legenda SVG para o arquivo funcionar fora da página.
    const width = Number(copy.getAttribute('width')),
      height = Number(copy.getAttribute('height'));
    copy.setAttribute('height', String(height + 32));
    copy.setAttribute('viewBox', `0 0 ${width} ${height + 32}`);
    supportSeries.forEach(({ key, label }, index) => {
      const x = 12 + (index * width) / 2;
      const swatch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      swatch.setAttribute('x', x);
      swatch.setAttribute('y', height + 10);
      swatch.setAttribute('width', '16');
      swatch.setAttribute('height', '3');
      swatch.setAttribute('fill', palette[key]);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + 22);
      text.setAttribute('y', height + 17);
      text.setAttribute('font-size', '11');
      text.setAttribute('fill', 'var(--ui-muted)');
      text.textContent = label;
      copy.append(swatch, text);
    });
    return download(
      new XMLSerializer().serializeToString(copy),
      'image/svg+xml',
      'evolucao-equipe-suporte-ambos.svg',
    );
  };
  return (
    <div ref={container}>
      <h3>Evolução de atendimentos efetivos · Ambos</h3>
      <p className="scope">
        Agendamentos pela coluna Agendamento; execuções pela Data de atendimento. Cada série mantém
        sua própria data. Períodos sem registro daquele papel ficam sem ponto.
      </p>
      {items.length ? (
        <>
          <PermissionButton action="export" onClick={exportChart}>
            Baixar evolução SVG
          </PermissionButton>
          <div className="dashboard-plot">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={items} margin={{ left: 0, right: 20, bottom: 12 }}>
                <CartesianGrid stroke="var(--ui-line)" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: 'var(--ui-muted)', fontSize: 11 }} />
                <YAxis
                  allowDecimals={false}
                  width={36}
                  tick={{ fill: 'var(--ui-muted)', fontSize: 11 }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {supportSeries.map(({ key, label }) => (
                  <Line
                    isAnimationActive={false}
                    key={key}
                    dataKey={key}
                    name={label}
                    stroke={color(key)}
                    strokeWidth={2}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="scope">Sem datas válidas para esta seleção.</p>
      )}
    </div>
  );
}
