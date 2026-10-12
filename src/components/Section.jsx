/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../shared/security/Access.jsx';
import { authorizeAction } from '../shared/security/accessClient.js';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { InfoNote } from './InfoNote.jsx';
import { alignHelp, helpChildren } from './HelpLayout.jsx';
import { reportHelpFor } from './reportHelp.js';
export const PrintContext = createContext({});
export const HiddenSectionsContext = createContext([]);
export const ExpansionContext = createContext(null);
/** Agrupa relatório, ajuda e impressão isolada com contexto de arquivo, filtros e referência temporal. */
export function Section({ title, visible = true, defaultOpen = true, summary, help, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const [compact, setCompact] = useState(false);
  const hasSummary = Boolean(summary);
  const expansion = useContext(ExpansionContext);
  // Conteúdo permanece montado ao recolher: gráficos, filtros e seleção não são reiniciados.
  useEffect(() => {
    if (expansion && typeof expansion.open === 'boolean') {
      setOpen(expansion.open);
      setCompact(hasSummary && expansion.mode === 'summary');
    }
  }, [expansion, hasSummary]);
  const section = useRef(),
    context = useContext(PrintContext);
  const hiddenSections = useContext(HiddenSectionsContext);
  const content = helpChildren(children),
    notes = content.filter((child) => React.isValidElement(child) && child.type === InfoNote);
  // A explicação específica da seção cobre cabeçalhos que antes dependiam apenas de notas internas.
  const description = help ?? reportHelpFor(title);
  async function print() {
    if (!(await authorizeAction('export'))) return;
    const frame = document.createElement('iframe');
    frame.title = 'Impressão da seção';
    frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-9999px';
    document.body.append(frame);
    const doc = frame.contentDocument;
    const heading = doc.createElement('h1');
    heading.textContent = title;
    const metadata = doc.createElement('p');
    metadata.textContent = `Arquivo: ${context.filename || '—'} | Filtros: ${JSON.stringify(context.filters || {})} | Referência temporal: ${context.referenceDate || '—'}`;
    const clone = section.current.cloneNode(true);
    clone.querySelectorAll('.summary-card').forEach((element) => {
      const card = doc.createElement('div');
      card.className = 'summary-card';
      card.innerHTML = element.innerHTML;
      element.replaceWith(card);
    });
    clone
      .querySelectorAll('.sort-heading')
      .forEach((element) => element.replaceWith(doc.createTextNode(element.textContent)));
    clone.querySelectorAll('button.geography-series').forEach((element) => {
      const series = doc.createElement('div');
      series.className = element.className;
      series.innerHTML = element.innerHTML;
      element.replaceWith(series);
    });
    clone.querySelectorAll('.bar-select').forEach((element) => {
      const label = doc.createElement('span');
      label.className = 'bar-name';
      label.textContent = element.title || element.textContent;
      element.replaceWith(label);
    });
    clone
      .querySelectorAll('button,input,select,[data-no-print],.recharts-tooltip-wrapper')
      .forEach((element) => element.remove());
    clone.querySelectorAll('details').forEach((element) => (element.open = true));
    const style = doc.createElement('style');
    style.textContent =
      ':root{--chart-main:#357a9a;--ui-chart-negative:#ba5675}@page{size:landscape;margin:12mm}body{font:11px Arial;color:#192c43}h1{font-size:20px}h2{font-size:15px}table{border-collapse:collapse;width:100%}th,td{padding:5px;border:1px solid #ccd5dd;white-space:normal!important;max-width:none!important;overflow:visible!important}thead{display:table-header-group}.table-scroll,.chart-bars,.readable-bars{max-height:none!important;overflow:visible!important}.panel{break-inside:auto}.scope{font-size:10px}svg{max-width:100%}th{position:static}.cards{display:flex;gap:15px}.chart-legend{list-style:none;padding:0}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.summary-card{border:1px solid #ccd5dd;padding:12px;display:flex;flex-direction:column;gap:8px}.summary-card strong{font-size:20px}.readable-bar-row{display:grid;grid-template-columns:34% 1fr 100px;gap:16px;align-items:center;padding:12px 0;break-inside:avoid}.bar-name{overflow-wrap:anywhere}.readable-track{position:relative;height:18px;background:#edf2f4;print-color-adjust:exact}.readable-track div{print-color-adjust:exact}.stack-track{display:flex;height:20px;background:#edf2f4;print-color-adjust:exact}.stack-track span{display:block;height:100%;print-color-adjust:exact}.visit-timeline li{margin:12px 0;break-inside:avoid}.geography-summary{display:flex;gap:24px;margin:15px 0}.geography-summary>div{display:flex;flex-direction:column;gap:5px}.geography-summary strong{font-size:20px}.geography-row{display:grid;grid-template-columns:20% 1fr;gap:16px;padding:12px 0;border-bottom:1px solid #edf1f4;break-inside:avoid}.geography-series-list{display:grid;gap:8px}.geography-series{display:grid;grid-template-columns:140px minmax(0,1fr) 130px;gap:10px;align-items:center}.geography-series strong{text-align:right}.geography-track{display:block;position:relative;height:14px;background:#edf2f4;border-radius:4px;print-color-adjust:exact}.geography-fill{display:block;position:absolute;height:100%;border-radius:4px;print-color-adjust:exact}.geography-zero{position:absolute;left:50%;height:100%;border-left:1px solid #687e91}.geography-legend span{print-color-adjust:exact}';
    style.textContent +=
      ' .info-print{display:block!important;margin:8px 0}.info-trigger{display:none!important}';
    doc.head.append(style);
    doc.title = title;
    doc.body.append(heading, metadata, clone);
    frame.contentWindow.addEventListener('afterprint', () => frame.remove(), { once: true });
    setTimeout(() => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    }, 200);
  }
  return (
    <section
      hidden={!visible || hiddenSections.includes(title)}
      className="workspace-section report-block"
    >
      <header className="report-heading">
        <div className="report-title">
          <h2>{title}</h2>
        </div>
        <div className="report-heading-actions">
          {hasSummary && (
            <button
              type="button"
              aria-label={`${compact ? 'Visão completa' : 'Visão resumida'} de ${title}`}
              onClick={() => {
                setOpen(true);
                setCompact((value) => !value);
              }}
            >
              {compact ? 'Completo' : 'Resumo'}
            </button>
          )}
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${open ? 'Recolher' : 'Abrir'} relatório ${title}`}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Recolher' : 'Abrir'}
          </button>
          {(description || notes.length > 0) && (
            <InfoNote label={`Regras de ${title}`}>
              {description && <p>{description}</p>}
              {notes.map((note, index) => (
                <p key={index}>{note.props.children}</p>
              ))}
            </InfoNote>
          )}
          <PermissionButton action="export" onClick={print}>
            Imprimir / Salvar PDF
          </PermissionButton>
        </div>
      </header>
      {hasSummary && (
        <div className="section-body" hidden={!open || !compact}>
          {summary}
        </div>
      )}
      <div className="section-body" hidden={!open || compact}>
        <div className="section-content" ref={section}>
          {description && <span className="info-print">{description}</span>}
          {content.map((child, index) =>
            notes.includes(child) ? (
              <span key={`note-${index}`} className="info-print">
                {child.props.children}
              </span>
            ) : (
              alignHelp(child)
            ),
          )}
        </div>
      </div>
    </section>
  );
}
