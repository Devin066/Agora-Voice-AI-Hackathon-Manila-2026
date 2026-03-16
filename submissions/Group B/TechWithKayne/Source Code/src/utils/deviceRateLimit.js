const STORAGE_KEY = 'ugnayai_red_escalations';
const MAX_PER_DAY = 3;

export function canEscalate() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"count":0,"date":""}');
  const today = new Date().toISOString().slice(0, 10);
  if (stored.date !== today) return true;
  return stored.count < MAX_PER_DAY;
}

export function recordEscalation() {
  const today = new Date().toISOString().slice(0, 10);
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"count":0,"date":""}');
  const count = stored.date === today ? stored.count + 1 : 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, date: today }));
}
