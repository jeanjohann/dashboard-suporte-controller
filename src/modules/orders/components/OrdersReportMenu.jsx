/** Categorias e preferências locais de relatórios de OS. */
import React from 'react';
import { SidebarContent } from '../../../app/SidePanel.jsx';
import { dashboardCategories } from '../config/dashboardCategories.js';
import { FilterCount } from '../../../components/FilterPanel.jsx';

/** Mantém identificadores de categoria e reseta apenas o comando global de expansão. */
export function OrdersCategories({ category, setCategory, setExpansion, filterCounts = {} }) {
  return (
    <SidebarContent>
      <nav className="category-navigation" aria-label="Categorias de análise">
        {dashboardCategories.map((item) => (
          <button
            key={item.key}
            aria-current={category === item.key ? 'page' : undefined}
            className={category === item.key ? 'active' : ''}
            onClick={() => {
              setCategory(item.key);
              setExpansion(null);
            }}
          >
            {item.label}
            <FilterCount count={filterCounts[item.key]} />
          </button>
        ))}
      </nav>
    </SidebarContent>
  );
}
