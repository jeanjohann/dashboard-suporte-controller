import { useEffect, useRef, useState } from 'react';

/** Tela de leitura com fallback quando o navegador não permite fullscreen. Não salva preferências. */
export function useDashboardPresentation(root) {
  const [presenting, setPresenting] = useState(false);
  const restorePrint = useRef(null);
  function exit() {
    setPresenting(false);
    if (document.fullscreenElement === root.current) document.exitFullscreen?.().catch(() => {});
  }
  function enter() {
    setPresenting(true);
  }
  function fullscreen() {
    try {
      root.current?.requestFullscreen?.().catch(() => {});
    } catch {
      /* A apresentação permanece disponível sem fullscreen. */
    }
  }
  useEffect(() => {
    const escape = (event) => {
      if (event.key === 'Escape' && presenting) exit();
    };
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('keydown', escape);
    };
  }, [presenting]);
  useEffect(() => {
    const done = () => {
      document.body.classList.remove('md-dashboard-printing');
      restorePrint.current?.();
      restorePrint.current = null;
    };
    window.addEventListener('afterprint', done);
    return () => {
      window.removeEventListener('afterprint', done);
      done();
    };
  }, []);
  return {
    presenting,
    enter,
    exit,
    fullscreen,
    print() {
      if (!root.current) return;
      const time = root.current.querySelector('[data-dashboard-print-time]');
      if (time)
        time.textContent = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      restorePrint.current?.();
      const details = [...root.current.querySelectorAll('details')].map((el) => [el, el.open]);
      restorePrint.current = () =>
        details.forEach(([el, open]) => {
          el.open = open;
        });
      details.forEach(([el]) => {
        el.open = true;
      });
      document.body.classList.add('md-dashboard-printing');
      try {
        window.print();
      } catch {
        document.body.classList.remove('md-dashboard-printing');
        restorePrint.current?.();
        restorePrint.current = null;
      }
    },
  };
}
