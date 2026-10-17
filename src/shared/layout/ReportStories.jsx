/**
 * Reúne relatórios existentes em uma única área de leitura, com uma visualização por vez.
 * Os portais mantêm o painel no mesmo lugar e conservam o estado dos relatórios montados.
 * Cada visualização conserva título, ajuda, preferência, impressão e cálculo de origem.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

const StoryContext = createContext(null);
const emptyGroups = [];

export function ReportStories({ groups = emptyGroups, children }) {
  const [members, setMembers] = useState({});
  const [targets, setTargets] = useState({});
  const [selected, setSelected] = useState({});
  const [revisions, setRevisions] = useState({});
  const [focusGroup, setFocusGroup] = useState(null);
  const focusTargets = useRef({});
  const register = useCallback((title, available) => {
    setMembers((previous) =>
      previous[title] === available ? previous : { ...previous, [title]: available },
    );
    return () =>
      setMembers((previous) => {
        if (!Object.hasOwn(previous, title)) return previous;
        const next = { ...previous };
        delete next[title];
        return next;
      });
  }, []);
  // Referências estáveis evitam desmontar os destinos quando outra visualização é escolhida.
  const slots = useMemo(
    () =>
      Object.fromEntries(
        groups.map((group) => [
          group.id,
          (node) => {
            setTargets((previous) =>
              previous[group.id] === node ? previous : { ...previous, [group.id]: node },
            );
          },
        ]),
      ),
    [groups],
  );
  const stories = groups.map((group) => {
    const views = group.views.filter((view) => members[view.title]);
    const active = views.some((view) => view.title === selected[group.id])
      ? selected[group.id]
      : views[0]?.title;
    focusTargets.current[group.id] ||= { current: null };
    return {
      ...group,
      views,
      active,
      revision: revisions[group.id] || 0,
      target: targets[group.id],
      focusRef: focusTargets.current[group.id],
    };
  });
  useEffect(() => {
    if (!focusGroup) return;
    focusTargets.current[focusGroup]?.current?.focus();
    setFocusGroup(null);
  }, [focusGroup, selected]);
  const context = {
    register,
    entries: Object.fromEntries(
      groups.flatMap((group) =>
        group.views.map((view) => [view.title, stories.find((story) => story.id === group.id)]),
      ),
    ),
    select: (id, title) => {
      setSelected((previous) => ({ ...previous, [id]: title }));
      setRevisions((previous) => ({ ...previous, [id]: (previous[id] || 0) + 1 }));
      setFocusGroup(id);
    },
  };
  return (
    <StoryContext.Provider value={context}>
      {stories.map((story) => (
        <div
          key={story.id}
          ref={slots[story.id]}
          className="report-story-slot"
          hidden={!story.views.length}
        />
      ))}
      {children}
    </StoryContext.Provider>
  );
}

/** A disponibilidade real inclui condições da base, categoria e preferências da página. */
export function useReportStory(title, available) {
  const context = useContext(StoryContext);
  const story = context?.entries[title];
  const register = context?.register;
  const grouped = Boolean(story);
  useEffect(
    () => (grouped ? register(title, available) : undefined),
    [register, title, available, grouped],
  );
  return story ? { ...story, select: context.select } : null;
}

export function StoryViewControl({ story, title }) {
  return (
    <label className="report-story-control" data-no-print>
      <span>Visualização</span>
      <select
        aria-label={`Visualização · ${story.title}`}
        value={story.active || title}
        ref={story.active === title ? story.focusRef : null}
        onChange={(event) => story.select(story.id, event.target.value)}
      >
        {story.views.map((view) => (
          <option key={view.title} value={view.title}>
            {view.label || view.title}
          </option>
        ))}
      </select>
    </label>
  );
}

export function StoryPortal({ story, children }) {
  return story ? (story.target ? createPortal(children, story.target) : null) : children;
}
