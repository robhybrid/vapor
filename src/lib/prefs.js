const PREFS_KEY = 'vapor-prefs';

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Could not load prefs', e);
    return {};
  }
}

export function savePrefs(partial) {
  const current = loadPrefs();
  const next = { ...current, ...partial };
  localStorage.setItem(PREFS_KEY, JSON.stringify(next));
}
