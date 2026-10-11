/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import React, { useState } from 'react';
import { Chart } from './Chart.jsx';
/** Adapta dados de contagem ao componente compartilhado de gráficos. */
export function BarChart({
  title,
  description,
  items,
  format = (value) => value.toLocaleString('pt-BR'),
}) {
  const [type, setType] = useState('bars');
  return (
    <section className="panel chart-panel">
      <div className="chart-heading">
        <h2>{title}</h2>
        <label>
          Gráfico{' '}
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="bars">Barras</option>
            <option value="line">Linhas</option>
            <option value="pie">Pizza</option>
            <option value="donut">Rosca</option>
          </select>
        </label>
      </div>
      <p className="scope">{description}</p>
      <Chart items={items} type={type} title={title} format={format} />
    </section>
  );
}
