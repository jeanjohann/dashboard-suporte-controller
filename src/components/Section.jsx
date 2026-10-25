/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../shared/security/Access.jsx';
import { authorizeAction } from '../shared/security/accessClient.js';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { InfoNote } from './InfoNote.jsx';
import { usePrintMode, PrintPreparationContext } from '../shared/charts/usePrintMode.js';
import { flushSync } from 'react-dom';
import { alignHelp, helpChildren } from './HelpLayout.jsx';
import { reportHelpFor } from './reportHelp.js';
import { useLayoutContext } from '../shared/layout/PageLayout.jsx';
import { availableLayoutMode } from '../shared/layout/pageLayout.js';
import { useReportStory, StoryPortal, StoryViewControl } from '../shared/layout/ReportStories.jsx';
import { reportPrintStyles } from '../shared/export/reportPrintStyles.js';
import { printContextEntries } from '../shared/export/printContext.js';
import { usePageActivity } from '../shared/layout/PageActivity.jsx';
export const PrintContext = createContext({});
export const HiddenSectionsContext = createContext([]);
export const ExpansionContext = createContext(null);
/** Agrupa relatório, ajuda e impressão isolada com contexto de arquivo, filtros e referência temporal. */
export function Section({ title, visible = true, defaultOpen = true, summary, help, children }) {
  const printing = usePrintMode();
  const [preparingPrint, setPreparingPrint] = useState(false);
  const [open, setOpen] = useState(defaultOpen);
  const [compact, setCompact] = useState(false);
  const hasSummary = Boolean(summary);
  const layout = useLayoutContext();
  const preference = layout?.entries[title];
  const register = layout?.register;
  useEffect(() => register?.(title, hasSummary), [register, title, hasSummary]);
  useEffect(() => {
    if (!preference) return;
    const mode = availableLayoutMode(preference.mode, hasSummary);
    setOpen(mode === 'default' ? defaultOpen : mode !== 'collapsed');
    setCompact(mode === 'summary');
  }, [preference, hasSummary, defaultOpen]);
  const expansion = useContext(ExpansionContext);
  // A apresentação da seção permanece; o conteúdo pesado só existe enquanto está disponível.
  useEffect(() => {
    if (expansion && typeof expansion.open === 'boolean') {
      setOpen(expansion.open);
      setCompact(hasSummary && expansion.mode === 'summary');
    }
  }, [expansion, hasSummary]);
  const section = useRef(),
    context = useContext(PrintContext);
  const hiddenSections = useContext(HiddenSectionsContext);
  const pageActive = usePageActivity();
  const available = visible && !hiddenSections.includes(title) && preference?.visible !== false;
  const recordPresentation = layout?.recordPresentation;
  useEffect(() => {
    recordPresentation?.(
      title,
      open ? (compact && hasSummary ? 'summary' : 'complete') : 'collapsed',
    );
  }, [recordPresentation, title, open, compact, hasSummary]);
  const story = useReportStory(title, available);
  const contentActive = Boolean(
    printing ||
    preparingPrint ||
    (pageActive &&
      available &&
      open &&
      !(hasSummary && compact) &&
      (!story || story.active === title)),
  );
  // Escolher uma visualização é uma abertura explícita; o modo inicial salvo continua valendo ao entrar.
  useEffect(() => {
    if (story?.revision && story.active === title) setOpen(true);
  }, [story?.revision]);
  const content = helpChildren(children),
    notes = content.filter((child) => React.isValidElement(child) && child.type === InfoNote);
  // A explicação específica da seção cobre cabeçalhos que antes dependiam apenas de notas internas.
  const description = help ?? reportHelpFor(title);
  async function print() {
    if (!(await authorizeAction('export'))) return;
    flushSync(() => setPreparingPrint(true));
    const frame = document.createElement('iframe');
    frame.title = 'Impressão da seção';
    frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-9999px';
    document.body.append(frame);
    const doc = frame.contentDocument;
    const heading = doc.createElement('h1');
    heading.textContent = story ? `${story.title} · ${title}` : title;
    const metadata = doc.createElement('dl');
    metadata.className = 'print-metadata';
    for (const [label, value] of printContextEntries(context)) {
      const item = doc.createElement('div'),
        name = doc.createElement('dt'),
        content = doc.createElement('dd');
      name.textContent = label;
      content.textContent = value;
      item.append(name, content);
      metadata.append(item);
    }
    const clone = section.current.cloneNode(true);
    setPreparingPrint(false);
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
    // O nome da pessoa está no acionador do card; preservá-lo antes de remover controles da impressão.
    clone.querySelectorAll('button.support-person-trigger').forEach((element) => {
      const heading = doc.createElement('div');
      heading.className = 'support-person-trigger';
      heading.textContent = element.querySelector('strong')?.textContent || element.textContent;
      element.replaceWith(heading);
    });
    clone
      .querySelectorAll('button,input,select,[data-no-print],.recharts-tooltip-wrapper')
      .forEach((element) => element.remove());
    clone.querySelectorAll('details').forEach((element) => (element.open = true));
    const style = doc.createElement('style');
    style.textContent =
      ':root{--chart-main:#eb8726;--ui-chart-negative:#ba5675}@page{size:landscape;margin:12mm}body{font:11px Arial;color:#192c43}h1{font-size:20px}h2{font-size:15px}table{border-collapse:collapse;width:100%}th,td{padding:5px;border:1px solid #ccd5dd;white-space:normal!important;max-width:none!important;overflow:visible!important}thead{display:table-header-group}.table-scroll,.chart-bars,.readable-bars{max-height:none!important;overflow:visible!important}.panel{break-inside:auto}.scope{font-size:10px}svg{max-width:100%}th{position:static}.cards{display:flex;gap:15px}.chart-legend{list-style:none;padding:0}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.summary-card{border:1px solid #ccd5dd;padding:12px;display:flex;flex-direction:column;gap:8px}.summary-card strong{font-size:20px}.readable-bar-row{display:grid;grid-template-columns:34% 1fr 100px;gap:16px;align-items:center;padding:12px 0;break-inside:avoid}.bar-name{overflow-wrap:anywhere}.readable-track{position:relative;height:18px;background:#edf2f4;print-color-adjust:exact}.readable-track div{print-color-adjust:exact}.stack-track{display:flex;height:20px;background:#edf2f4;print-color-adjust:exact}.stack-track span{display:block;height:100%;print-color-adjust:exact}.visit-timeline li{margin:12px 0;break-inside:avoid}.geography-summary{display:flex;gap:24px;margin:15px 0}.geography-summary>div{display:flex;flex-direction:column;gap:5px}.geography-summary strong{font-size:20px}.geography-row{display:grid;grid-template-columns:20% 1fr;gap:16px;padding:12px 0;border-bottom:1px solid #edf1f4;break-inside:avoid}.geography-series-list{display:grid;gap:8px}.geography-series{display:grid;grid-template-columns:140px minmax(0,1fr) 130px;gap:10px;align-items:center}.geography-series strong{text-align:right}.geography-track{display:block;position:relative;height:14px;background:#edf2f4;border-radius:4px;print-color-adjust:exact}.geography-fill{display:block;position:absolute;height:100%;border-radius:4px;print-color-adjust:exact}.geography-zero{position:absolute;left:50%;height:100%;border-left:1px solid #687e91}.geography-legend span{print-color-adjust:exact}';
    style.textContent +=
      ' .info-print{display:block!important;margin:8px 0}.info-trigger{display:none!important}';
    style.textContent +=
      ' :root{--chart-secondary:#16a58b}.support-comparison-rows{max-height:none;overflow:visible}.support-comparison-row{display:grid;grid-template-columns:28% 1fr;gap:16px;padding:10px 0;break-inside:avoid}.support-comparison-values{display:grid;gap:10px}.support-comparison-series{display:grid;grid-template-columns:100px 1fr 46px;gap:10px;align-items:center}.support-comparison-series .readable-track>div{height:100%}.support-comparison-series strong{text-align:right}';
    style.textContent +=
      ' .support-metric-grid,.support-extra-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0}.support-metric,.support-person-card{border:1px solid #ccd5dd;padding:10px;break-inside:avoid}.support-metric-heading{font-weight:bold}.support-metric-values,.support-person-values{display:flex;gap:20px}.support-metric-values strong{display:block;font-size:20px}.support-role-compact{display:none}.support-role-label,.support-delta{display:block;font-size:10px}.support-person-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.support-person-trigger{font-weight:bold;margin-bottom:8px}.support-person-values dl{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.support-person-values dd{margin:0;font-weight:bold}.support-person-detail{border:1px solid #ccd5dd;padding:12px;margin-top:12px}.support-person-role-grid{display:grid;grid-template-columns:1fr;gap:16px}.support-person-detail .scope{font-size:10px}';
    style.textContent += reportPrintStyles;
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
    <StoryPortal story={story}>
      <section
        hidden={!available || (story && story.active !== title)}
        className="workspace-section report-block"
      >
        <header className="report-heading">
          <div className="report-title">
            <h2>{story?.title || title}</h2>
            {story && <StoryViewControl story={story} title={title} />}
            {(description || notes.length > 0) && (
              <InfoNote label={`Regras de ${title}`}>
                {description && <p>{description}</p>}
                {notes.map((note, index) => (
                  <p key={index}>{note.props.children}</p>
                ))}
              </InfoNote>
            )}
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
            <PermissionButton action="export" onClick={print}>
              Imprimir / Salvar PDF
            </PermissionButton>
          </div>
        </header>
        {story && (
          <p className="report-story-context">
            <strong>{title}</strong>
            {story.description && <> · {story.description}</>}
          </p>
        )}
        {hasSummary && (
          <div className="section-body" hidden={!open || !compact}>
            {summary}
          </div>
        )}
        <div className="section-body" hidden={!open || (hasSummary && compact)}>
          <div className="section-content" ref={section}>
            {description && <span className="info-print">{description}</span>}
            {contentActive && (
              <PrintPreparationContext.Provider value={printing || preparingPrint}>
                {content.map((child, index) =>
                  notes.includes(child) ? (
                    <span key={`note-${index}`} className="info-print">
                      {child.props.children}
                    </span>
                  ) : (
                    alignHelp(child)
                  ),
                )}
              </PrintPreparationContext.Provider>
            )}
          </div>
        </div>
      </section>
    </StoryPortal>
  );
}
