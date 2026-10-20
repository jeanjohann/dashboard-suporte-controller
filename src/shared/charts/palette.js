/** Tokens acompanham o tema; exportações em fundo branco usam cores concretas portáteis. */
const printColors = {
  primary: '#158579',
  blue: '#3c7cc4',
  teal: '#169d8c',
  purple: '#8b62c0',
  coral: '#d4764e',
  slate: '#648399',
  amber: '#b18720',
  rose: '#ba5e8a',
  other: '#85968f',
  negative: '#b75470',
};
export const chartColors = Object.fromEntries(
  Object.keys(printColors).map((key) => [key, `var(--chart-${key})`]),
);
export const chartPrintVariables = Object.entries(printColors)
  .map(([key, color]) => `--chart-${key}:${color}`)
  .join(';');
export function chartExportColor(value) {
  const key = Object.keys(chartColors).find((key) => chartColors[key] === value);
  return key
    ? printColors[key]
    : typeof value === 'string' && value.startsWith('var(')
      ? printColors.primary
      : value;
}

export const categoricalColors = [
  chartColors.blue,
  chartColors.teal,
  chartColors.coral,
  chartColors.purple,
  chartColors.primary,
  chartColors.slate,
  chartColors.amber,
  chartColors.rose,
];
