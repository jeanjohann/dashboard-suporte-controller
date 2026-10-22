/** Limites cumulativos e faixas exclusivas; horas corridas desde a última comunicação. */
export const monitoringThresholds = [48, 72, 96, 720, 1440, 2160];
export const monitoringPeriodLabel = (hours) =>
  hours >= 720 ? `${hours / 24} dias` : `${hours} horas`;
export const monitoringBands = [
  { from: 48, to: 72, label: '48 a <72 h' },
  { from: 72, to: 96, label: '72 a <96 h' },
  { from: 96, to: 720, label: '96 h a <30 dias' },
  { from: 720, to: 1440, label: '30 a <60 dias' },
  { from: 1440, to: 2160, label: '60 a <90 dias' },
  { from: 2160, to: Infinity, label: '90 dias ou mais' },
];
