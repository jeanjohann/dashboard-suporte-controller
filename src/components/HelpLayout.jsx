/** Organiza explicações de blocos HTML sem alterar seus controles ou regras de cálculo. */
import React from 'react';
import { InfoNote } from './InfoNote.jsx';

export function helpChildren(children) {
  return React.Children.toArray(children).flatMap((child) =>
    React.isValidElement(child) && child.type === React.Fragment
      ? helpChildren(child.props.children)
      : [child],
  );
}

export function alignHelp(children) {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || child.type === InfoNote) return child;
    // Componentes de domínio administram a própria estrutura; percorremos somente HTML e fragmentos.
    if (typeof child.type !== 'string' && child.type !== React.Fragment) return child;
    if (!child.props.children) return child;
    const items = helpChildren(child.props.children);
    const heading = items.find(
      (item) =>
        React.isValidElement(item) &&
        typeof item.type === 'string' &&
        /^(h[234]|summary)$/.test(item.type),
    );
    const notes = items.filter((item) => React.isValidElement(item) && item.type === InfoNote);
    if (!heading || !notes.length) {
      return React.cloneElement(child, {}, alignHelp(child.props.children));
    }
    return React.cloneElement(
      child,
      {},
      items.map((item, index) => {
        if (item === heading) {
          const explanation = (
            <InfoNote
              label={`Sobre ${typeof heading.props.children === 'string' ? heading.props.children : 'esta seção'}`}
            >
              {notes.map((note, i) => (
                <p key={i}>{note.props.children}</p>
              ))}
            </InfoNote>
          );
          return heading.type === 'summary' ? (
            React.cloneElement(
              heading,
              { className: 'inline-help-heading', key: 'help-heading' },
              <span>{heading.props.children}</span>,
              explanation,
            )
          ) : (
            <div className="inline-help-heading" key="help-heading">
              {heading}
              {explanation}
            </div>
          );
        }
        if (notes.includes(item)) return null;
        return alignHelp(item);
      }),
    );
  });
}
