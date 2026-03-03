export interface LetterEntry {
  id: string;
  date: string;
  time: string;
  content: string;
  emotionalState: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "letter-to-self-entries";

export function getEntries(): LetterEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LetterEntry[];
  } catch {
    return [];
  }
}

export function saveEntry(entry: LetterEntry): void {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function getCurrentTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
