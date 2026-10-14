/** Índice da última ação por operadora + ICCID. Empates de data usam a última entrada registrada. */
import { chipKey } from './lineConsumption.js';
export function latestConsumptionNotes(notes) {
  const latest = new Map();
  for (const note of notes) {
    const key = chipKey(note),
      previous = latest.get(key);
    if (!previous || note.date >= previous.date) latest.set(key, note);
  }
  return latest;
}
