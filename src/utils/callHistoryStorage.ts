import type { CallHistoryEntry, GroupedCallHistory } from '../types/callHistory';

const STORAGE_KEY = 'magikvoice_call_history';

export function getCallHistory(): CallHistoryEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading call history:', error);
    return [];
  }
}

export function saveCallToHistory(entry: CallHistoryEntry): void {
  try {
    const history = getCallHistory();
    // Add new entry at the beginning
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving call to history:', error);
  }
}

export function deleteCallFromHistory(callId: string): void {
  try {
    const history = getCallHistory();
    const filtered = history.filter((entry) => entry.callId !== callId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting call from history:', error);
  }
}

export function clearCallHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing call history:', error);
  }
}

export function getGroupedCallHistory(): GroupedCallHistory {
  const history = getCallHistory();
  const grouped: GroupedCallHistory = {};

  for (const entry of history) {
    if (!grouped[entry.agentId]) {
      grouped[entry.agentId] = {
        agentName: entry.agentName,
        languages: {},
      };
    }

    if (!grouped[entry.agentId].languages[entry.language]) {
      grouped[entry.agentId].languages[entry.language] = [];
    }

    grouped[entry.agentId].languages[entry.language].push(entry);
  }

  return grouped;
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDuration(seconds: string): string {
  const totalSeconds = parseInt(seconds, 10);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
