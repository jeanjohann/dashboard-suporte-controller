/** Complemento da cópia isolada de impressão: texto integral, tabelas e tema claro. */
export const reportPrintStyles = `
:root{color-scheme:light;--ui-background:#fff;--ui-surface:#fff;--ui-soft:#f4f5f7;--ui-ink:#192c43;--ui-muted:#526477;--ui-border:#ccd5dd;--ui-line:#e5e9ee;--ui-accent:#eb8726;--ui-accent-ink:#97501a;--chart-main:#eb8726;--chart-secondary:#16a58b}
body{margin:0;line-height:1.45}h1,h2,h3,h4,summary{break-after:avoid}h3{font-size:13px}.print-metadata{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px 18px;margin:12px 0 16px;color:#526477;font-size:10px}.print-metadata>div{display:flex;gap:6px;min-width:0}.print-metadata dt{font-weight:bold;white-space:nowrap}.print-metadata dd{margin:0;overflow-wrap:anywhere}
table{table-layout:auto}thead{display:table-header-group}tr{break-inside:avoid}th,td{font-size:10px;overflow-wrap:anywhere}th{text-align:left;background:#f4f5f7}
[data-cell-type=number]{text-align:right;font-variant-numeric:tabular-nums}.cell-identifier{font-family:Consolas,monospace}
.table-viewport,.table-scroll{width:100%;overflow:visible!important;max-height:none!important}.table-cell-text{max-width:none!important;white-space:normal!important;overflow:visible!important;display:block}
.analysis-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}.analysis-metrics .summary-card{display:block;background:#fff;padding:10px;border:1px solid #ccd5dd;break-inside:avoid}.analysis-metrics .summary-card strong{display:block;font-size:22px;margin:6px 0}.analysis-metrics .summary-card small{display:block;font-size:9px;color:#526477}
.analysis-secondary,.analysis-context-details{margin:14px 0}summary{font-weight:bold;margin:8px 0}.analysis-context,.scope{color:#526477}.view-state{padding:10px;border:1px solid #ccd5dd}.view-state svg{display:none}.view-state p{margin:5px 0}
.analysis-secondary>summary>span{margin-left:10px;font-weight:normal;font-size:9px;color:#526477}
.dashboard-chart-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.dashboard-widget{min-width:0;break-inside:avoid;margin:14px 0}.table-scroll-hint,.table-pagination,.chart-tools>summary,.chart-heading label{display:none!important}
.overview-comparison-body{height:auto!important;max-height:none!important;overflow:visible!important}
`;
