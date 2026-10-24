/** Tokens acompanham o tema; exportações em fundo branco usam cores concretas portáteis. */
const printColors = {
  primary: '#19786f',
  blue: '#3d6fa1',
  teal: '#238779',
  purple: '#77589d',
  coral: '#b45d42',
  slate: '#586d7b',
  amber: '#8a691e',
  rose: '#a55176',
  other: '#607b57',
  negative: '#ac4058',
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
