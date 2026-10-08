/**
 * Utility to format task and complaint timestamps into human-readable, accurate strings.
 * Handles:
 * - ISO date strings ("2026-10-01T00:15:00.000Z")
 * - Formatted strings ("Today, 10:15 AM", "Yesterday, 04:30 PM", "Just now")
 * - Simple time strings ("10:15 AM", "09:30")
 * - Numeric timestamps (milliseconds since epoch)
 * - Date objects
 */
export const formatTaskTime = (value?: string | number | Date | null): string => {
  if (!value) return '';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';

    // If already has relative/friendly prefix
    if (
      trimmed.startsWith('Today') ||
      trimmed.startsWith('Yesterday') ||
      trimmed.toLowerCase().includes('ago') ||
      trimmed === 'Just now'
    ) {
      return trimmed;
    }

    // If it's a simple time string like "10:15 AM" or "10:15 PM"
    if (/^\d{1,2}:\d{2}(\s?[AP]M)?$/i.test(trimmed)) {
      return `Today, ${trimmed}`;
    }

    // Try parsing as ISO or Date string
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed) && (trimmed.includes('-') || trimmed.includes('T') || !isNaN(Number(trimmed)))) {
      return formatDateInstance(new Date(parsed));
    }

    return trimmed;
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return formatDateInstance(parsed);
    }
  }

  if (value instanceof Date && !isNaN(value.getTime())) {
    return formatDateInstance(value);
  }

  return String(value);
};

export const getCurrentFormattedTime = (): string => {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `Today, ${time}`;
};

const formatDateInstance = (d: Date): string => {
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `Today, ${time}`;

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isYesterday) return `Yesterday, ${time}`;

  const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${dateStr}, ${time}`;
};
