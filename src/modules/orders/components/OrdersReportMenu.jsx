/** Categorias e preferências locais de relatórios de OS. */
import React from 'react';
import { SidebarContent } from '../../../app/SidePanel.jsx';
import { dashboardCategories, categoryVisibility } from '../config/dashboardCategories.js';
import { sectionLabels, cleanPreferences } from '../config/preferences.js';

/** Mantém identificadores de categoria e reseta apenas o comando global de expansão. */
export function OrdersCategories({ category, setCategory, setExpansion }) {
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
          </button>
        ))}
      </nav>
    </SidebarContent>
  );
}

/** Escolhas persistidas pela página, sem alterar filtros ou montar/desmontar os relatórios. */
export function OrdersReportChoices({ category, preferences, setVisibility, layoutMessage }) {
  return (
    <SidebarContent>
      <section className="sidebar-reports" aria-label="Relatórios exibidos">
        <h3>Relatórios exibidos</h3>
        <div className="preference-grid">
          {Object.entries(sectionLabels)
            .filter(
              ([key]) =>
                category !== 'overview' &&
                !['filters', 'extras'].includes(key) &&
                categoryVisibility(cleanPreferences({}), category)[key],
            )
            .map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  onChange={(event) =>
                    setVisibility({ ...preferences, [key]: event.target.checked })
                  }
                />
                {label}
              </label>
            ))}
        </div>
        <button onClick={() => setVisibility(cleanPreferences({}))}>Mostrar todas as seções</button>
        <p className="scope">
          Ocultar não altera cálculos nem filtros. As seleções ativas permanecem no resumo abaixo.{' '}
          {layoutMessage}
        </p>
        {category === 'overview' && (
          <p className="scope">Selecione uma categoria para escolher os relatórios exibidos.</p>
        )}
      </section>
    </SidebarContent>
  );
}
