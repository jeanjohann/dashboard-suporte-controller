import React from 'react';

/** Atalhos acionáveis para prioridades da mesma base e seleção analítica. */
export function MonitoringPriorityCards({
  result,
  overdue,
  canReview,
  registryCount,
  registryReady,
  activeFocus,
  onFocus,
  onRegistry,
}) {
  const cards = [
    {
      key: 'alerts',
      focus: 'alerts',
      label: 'Acima do limite',
      value: result.totals.delayed,
      note: 'Abrir alertas no recorte atual',
      onClick: () => onFocus('alerts'),
    },
    {
      key: 'critical',
      focus: 'critical',
      label: '4 dias ou mais',
      value: result.totals.critical,
      note: 'Coletas utilizáveis, independente do limite',
      onClick: () => onFocus('critical'),
    },
    {
      key: 'reminders',
      focus: 'overdue-reminders',
      label: 'Lembretes vencidos',
      value: overdue,
      note: 'Ver veículos com retorno pendente',
      onClick: () => onFocus('overdue-reminders'),
    },
    {
      key: 'registry',
      label: 'Cadastros para conferir',
      value: registryReady ? registryCount : '—',
      note: registryReady ? 'API × Operacional · abrir conferência' : 'Carregue a base Operacional',
      onClick: onRegistry,
    },
  ];
  return (
    <section className="monitoring-priorities" aria-label="Prioridades do monitoramento">
      {cards
        .filter((card) => card.key !== 'registry' || canReview)
        .map((card) => (
          <button
            type="button"
            className={`summary-card monitoring-priority-card monitoring-priority-${card.key}`}
            key={card.key}
            title={card.note}
            aria-label={`${card.label}: ${card.value}. ${card.note}`}
            aria-pressed={!!card.focus && activeFocus === card.focus}
            onClick={card.onClick}
          >
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </button>
        ))}
    </section>
  );
}
