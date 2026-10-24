import React, { memo } from 'react';

/** Pausa atualizações vindas do pai enquanto oculto, sem desmontar estado e rascunhos.
 * Contextos de segurança continuam propagando; tarefas internas precisam de atividade explícita.
 */
export const RetainedContent = memo(
  function RetainedContent({ children }) {
    return children;
  },
  (previous, next) => !previous.active && !next.active,
);
