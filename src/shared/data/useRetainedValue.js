import { useRef } from 'react';

/** Mantém a última entrada da apresentação enquanto inativa; retoma com a fonte mais recente. */
export function useRetainedValue(value, active) {
  const retained = useRef(value);
  if (active || retained.current == null) retained.current = value;
  return retained.current;
}
