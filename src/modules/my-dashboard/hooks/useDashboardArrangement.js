import { useRef, useState } from 'react';
import { placeWidget, widgetDimensions } from '../domain/boardActions.js';

/** Gestos de mouse/caneta/toque. A edição é confirmada uma vez ao soltar; Escape/cancelar não grava. */
export function useDashboardArrangement({ enabled, widgets, onChange }) {
  const grid = useRef(null),
    gesture = useRef(null);
  const [preview, setPreview] = useState(null);
  const cancel = () => {
    gesture.current = null;
    setPreview(null);
  };
  function start(event, id, kind) {
    if (!enabled || event.button !== 0) return;
    const article = event.currentTarget.closest('[data-widget-id]');
    const box = article.getBoundingClientRect();
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      id,
      kind,
      x: event.clientX,
      y: event.clientY,
      box,
      article,
      size: widgets.find((w) => w.id === id)?.size,
      moved: false,
    };
  }
  function move(event) {
    const current = gesture.current;
    if (!current || !enabled) return;
    const dx = event.clientX - current.x,
      dy = event.clientY - current.y;
    if (Math.abs(dx) + Math.abs(dy) < 6 && !current.moved) return;
    current.moved = true;
    if (current.kind === 'resize') {
      const dimensions = widgetDimensions(
        current.box.width + dx,
        current.box.height + dy,
        grid.current.clientWidth,
      );
      if (Math.abs(dx) < 30) dimensions.size = current.size;
      current.next = { kind: 'resize', id: current.id, ...dimensions };
    } else {
      const target = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest('[data-widget-id]');
      const box = target?.getBoundingClientRect();
      const sameRow = box && Math.abs(box.y - current.article.getBoundingClientRect().y) < 24;
      const after = box
        ? sameRow
          ? event.clientX > box.x + box.width / 2
          : event.clientY > box.y + box.height / 2
        : false;
      current.next = { kind: 'move', id: current.id, target: target?.dataset.widgetId, after };
      if (event.clientY < 70) window.scrollBy(0, -18);
      else if (event.clientY > window.innerHeight - 70) window.scrollBy(0, 18);
    }
    setPreview(current.next);
  }
  function finish() {
    const next = gesture.current?.next;
    cancel();
    if (!enabled || !next) return;
    if (next.kind === 'move') onChange(placeWidget(widgets, next.id, next.target, next.after));
    else
      onChange(
        widgets.map((w) => (w.id === next.id ? { ...w, size: next.size, height: next.height } : w)),
      );
  }
  return {
    grid,
    preview,
    start,
    cancel,
    handlers: {
      onPointerMove: move,
      onPointerUp: finish,
      onPointerCancel: cancel,
      onKeyDown: (event) => {
        if (event.key === 'Escape') cancel();
      },
      onLostPointerCapture: cancel,
    },
  };
}
