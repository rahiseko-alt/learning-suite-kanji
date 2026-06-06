const SAVED_SETS_KEY = 'learning-suite:kanji:saved-sets';

export function loadSavedSets() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_SETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string') : [];
  } catch { return []; }
}

export function saveSavedSets(ids) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(ids));
}

export function toggleSavedSet(id) {
  const current = loadSavedSets();
  const next = current.includes(id)
    ? current.filter(s => s !== id)
    : [...current, id];
  saveSavedSets(next);
  return next;
}
