/** Modal de apresentação: alterações são rascunhos até Salvar; dialog nativo oferece foco modal e Escape. */
import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon.jsx';
import { useLayoutContext } from '../shared/layout/PageLayout.jsx';
import { availableLayoutMode } from '../shared/layout/pageLayout.js';

export function PageSettingsButton({ available = true, help = '' }) {
  const id = useId();
  const context = useLayoutContext();
  const dialog = useRef(),
    trigger = useRef(),
    heading = useRef();
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState({}),
    [message, setMessage] = useState(''),
    [feedback, setFeedback] = useState('');
  const scope = context?.scope;
  useEffect(() => {
    setOpen(false);
    setMessage('');
  }, [scope]);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element.showModal();
    heading.current?.focus();
    return () => {
      element.close();
      trigger.current?.focus();
    };
  }, [open]);
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);
  if (!context || (!available && !help)) return null;
  const { layout, definitions, activeIds, capabilities } = context;
  const items = definitions.filter(
    (item) => activeIds.includes(item.id) && Object.hasOwn(capabilities, item.title),
  );
  if (!items.length && !help) return null;
  function show() {
    setDraft(
      Object.fromEntries(
        items.map((item) => [
          item.id,
          {
            visible: layout.effective[item.id]?.visible !== false,
            mode: availableLayoutMode(layout.effective[item.id]?.mode, capabilities[item.title]),
          },
        ]),
      ),
    );
    setMessage('');
    setFeedback('');
    setOpen(true);
  }
  const edit = (id, key, value) =>
    setDraft((previous) => ({ ...previous, [id]: { ...previous[id], [key]: value } }));
  function save() {
    const patch = Object.fromEntries(
      items.map((item) => [item.id, draft[item.id] || { visible: true, mode: 'default' }]),
    );
    if (layout.save(patch)) {
      setOpen(false);
      setFeedback('Preferências da página salvas neste navegador.');
    } else
      setMessage(
        'Não foi possível gravar no navegador. As escolhas foram aplicadas somente nesta sessão; você pode tentar salvar novamente.',
      );
  }
  return (
    <>
      <button
        ref={trigger}
        className="page-settings-trigger"
        type="button"
        title="Configurações da página"
        aria-label="Configurações da página"
        aria-haspopup="dialog"
        onClick={show}
      >
        <Icon name="settings" size={18} />
      </button>
      {feedback && (
        <div className="page-settings-feedback" role="status">
          {feedback}
        </div>
      )}
      {createPortal(
        <dialog
          ref={dialog}
          className="page-settings-dialog"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
          onCancel={() => setOpen(false)}
          onClick={(event) => {
            if (event.target === dialog.current) {
              const bounds = dialog.current.getBoundingClientRect();
              if (
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom
              )
                setOpen(false);
            }
          }}
        >
          <header>
            <div>
              <h2 ref={heading} tabIndex={-1} id={`${id}-title`}>
                Configurações da página
              </h2>
              <p>{scope}</p>
            </div>
            <button type="button" aria-label="Fechar configuração" onClick={() => setOpen(false)}>
              <Icon name="close" size={18} />
            </button>
          </header>
          <div className="page-settings-body">
            <p id={`${id}-description`}>
              {items.length
                ? 'Escolha os relatórios desta categoria e como devem abrir. As preferências ficam neste navegador. As alterações são confirmadas em Salvar preferências. Relatórios agrupados aparecem no seletor Visualização do painel; cada opção mantém sua própria apresentação.'
                : `Informações e critérios de ${scope || 'uso'} desta página.`}
            </p>
            {help && (
              <section className="page-settings-help">
                <h3>Sobre esta página</h3>
                <p>{help}</p>
              </section>
            )}
            {!!items.length && (
              <>
                <div className="page-settings-columns" aria-hidden="true">
                  <span>Relatórios exibidos</span>
                  <span>Apresentação inicial</span>
                </div>
                {items.map((item) => (
                  <div className="page-settings-row" key={item.id}>
                    <label className="page-settings-choice">
                      <input
                        type="checkbox"
                        checked={draft[item.id]?.visible !== false}
                        onChange={(event) => edit(item.id, 'visible', event.target.checked)}
                      />
                      <span>{item.label || item.title}</span>
                    </label>
                    <select
                      aria-label={`Apresentação de ${item.label || item.title}`}
                      disabled={draft[item.id]?.visible === false}
                      value={draft[item.id]?.mode || 'default'}
                      onChange={(event) => edit(item.id, 'mode', event.target.value)}
                    >
                      <option value="default">Padrão do relatório</option>
                      <option value="complete">Completo</option>
                      {capabilities[item.title] && <option value="summary">Resumido</option>}
                      <option value="collapsed">Recolhido</option>
                    </select>
                  </div>
                ))}
                <p className="page-settings-note">
                  “Padrão do relatório” conserva a apresentação original de cada seção. Resumido
                  aparece somente onde há resumo disponível. Filtros e cálculos continuam os mesmos.
                </p>
              </>
            )}
            {message && (
              <p role="alert" className="notice">
                {message}
              </p>
            )}
          </div>
          <footer>
            {items.length ? (
              <>
                <button
                  type="button"
                  className="page-settings-reset"
                  onClick={() => {
                    setDraft(
                      Object.fromEntries(
                        items.map((item) => [item.id, { visible: true, mode: 'default' }]),
                      ),
                    );
                    setMessage('Padrão preparado. Clique em Salvar preferências para confirmar.');
                  }}
                >
                  Restaurar padrão
                </button>
                <div>
                  <button type="button" onClick={() => setOpen(false)}>
                    Cancelar
                  </button>
                  <button type="button" className="page-settings-save" onClick={save}>
                    Salvar preferências
                  </button>
                </div>
              </>
            ) : (
              <button type="button" className="page-settings-save" onClick={() => setOpen(false)}>
                Concluído
              </button>
            )}
          </footer>
        </dialog>,
        document.body,
      )}
    </>
  );
}
