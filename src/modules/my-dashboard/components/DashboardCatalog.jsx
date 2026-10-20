import React, { useMemo, useState } from 'react';
import { DashboardDialog } from './DashboardDialog.jsx';
import { dashboardModules, permittedCatalog } from '../domain/catalog.js';

export function DashboardCatalog({ user, sources, onClose, onSelect }) {
  const [search, setSearch] = useState(''),
    [module, setModule] = useState('');
  const catalog = useMemo(() => permittedCatalog(user), [user]);
  const shown = catalog.filter(
    (item) =>
      (!module || item.module === module) &&
      `${item.label} ${dashboardModules[item.module].label}`
        .toLocaleLowerCase('pt-BR')
        .includes(search.toLocaleLowerCase('pt-BR')),
  );
  return (
    <DashboardDialog
      title="Escolha o que você quer acompanhar"
      onClose={onClose}
      className="md-catalog"
    >
      <p className="md-muted">
        Indicadores com os mesmos critérios dos relatórios. Cada bloco mantém sua própria fonte e
        seus filtros.
      </p>
      <div className="md-catalog-filters">
        <label>
          Buscar indicador
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ex.: fechados, custo, consumo…"
          />
        </label>
        <label>
          Módulo
          <select value={module} onChange={(e) => setModule(e.target.value)}>
            <option value="">Todos os módulos disponíveis</option>
            {Object.entries(dashboardModules)
              .filter(([key]) => catalog.some((item) => item.module === key))
              .map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
          </select>
        </label>
      </div>
      <p className="md-muted" role="status">
        {shown.length} indicador(es) disponível(is)
      </p>
      <div className="md-catalog-list">
        {shown.map((item) => {
          const loaded = Boolean(
            sources[item.module === 'park' ? 'operational' : item.module]?.value,
          );
          return (
            <button
              type="button"
              className="md-catalog-item"
              key={item.id}
              onClick={() => onSelect(item)}
            >
              <span>
                <small>{dashboardModules[item.module].label}</small>
                <strong>{item.label}</strong>
                <span className="md-muted">
                  {item.kinds.includes('chart') ? 'Gráfico ou tabela' : 'Cartão ou tabela'} ·{' '}
                  {loaded ? 'Fonte carregada' : 'Carregar fonte no módulo de origem'}
                </span>
              </span>
              <span className="md-add" aria-hidden="true">
                ＋
              </span>
            </button>
          );
        })}
        {!shown.length && <p>Nenhum indicador encontrado. Tente outro termo ou módulo.</p>}
      </div>
    </DashboardDialog>
  );
}
