/** Rolagem de tabelas com indicação real de conteúdo lateral e acesso por teclado. */
import React, { useEffect, useRef, useState } from 'react';

export function TableScroll({ children, label = 'Tabela de dados', className = '' }) {
  const viewport = useRef(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const element = viewport.current;
    const measure = () => setOverflow(element.scrollWidth > element.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, [children]);
  return (
    <div className="table-viewport">
      {overflow && (
        <p className="table-scroll-hint" data-no-print>
          Tabela com rolagem horizontal · deslize ou use as setas com a tabela selecionada.
        </p>
      )}
      <div
        ref={viewport}
        className={`table-scroll ${className}`}
        tabIndex={overflow ? 0 : undefined}
        role="region"
        aria-label={label}
      >
        {children}
      </div>
    </div>
  );
}
