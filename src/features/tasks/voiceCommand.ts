import type { Task, Priority } from '../../types/task.types';

export type VoiceCommand =
  | { kind: 'add'; title: string; priority: Priority; deadline: Date | null }
  | { kind: 'complete'; title: string }
  | { kind: 'delete'; title: string }
  | { kind: 'unknown' };

const ADD_RE = /^(?:add|create)(?:\s+task)?\s+(.+)$/;
const COMPLETE_LEADING_RE = /^(?:complete|finish|done|check off)\s+(.+)$/;
const COMPLETE_TRAILING_RE = /^(.+?)\s+(?:as\s+)?(?:done|complete)$/;
const MARK_RE = /^mark\s+(.+)$/;
const DELETE_RE = /^(?:delete|remove|trash)\s+(.+)$/;

const WEEKDAYS = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];
const WEEKDAY_ALT = WEEKDAYS.join('|');

/** Speech recognizers return small counts as words about as often as digits. */
const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, ninety: 90,
};

const UNIT_MS: Record<string, number> = {
  minute: 60_000, min: 60_000,
  hour: 3_600_000, hr: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
};

const PRIORITY_RE =
  /\b(?:(low|medium|high|urgent)\s+priority|priority\s+(low|medium|high|urgent)|(urgent))\b/;

const RELATIVE_RE = /\bin\s+(\d+|[a-z]+)\s+(minutes?|mins?|hours?|hrs?|days?|weeks?)\b/;
const AMPM_TIME_RE = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/;
const BARE_TIME_RE = /\bat\s+(\d{1,2})(?::(\d{2}))?\b/;
const NAMED_TIME_RE = /\b(noon|midnight)\b/;
const DAY_WORD_RE = /\b(?:by\s+|on\s+|due\s+)?(today|tonight|tomorrow)\b/;
const WEEKDAY_PREFIXED_RE = new RegExp(`\\b(?:on|next|this|by)\\s+(${WEEKDAY_ALT})\\b`);
const WEEKDAY_TRAILING_RE = new RegExp(`\\s(${WEEKDAY_ALT})$`);

const DAY_MS = 86_400_000;

/** Strips a match out of the text, leaving the remainder for the title. */
const cut = (text: string, match: RegExpMatchArray): string =>
  (text.slice(0, match.index) + ' ' + text.slice((match.index ?? 0) + match[0].length));

function extractPriority(text: string): { priority: Priority; rest: string } {
  const match = text.match(PRIORITY_RE);
  if (!match) return { priority: 'medium', rest: text };
  const value = (match[1] ?? match[2] ?? match[3]) as Priority;
  return { priority: value, rest: cut(text, match) };
}

/**
 * Pulls a deadline out of the transcript. Handles "in 2 hours", "tomorrow",
 * "friday", "at 5pm", "tomorrow at 5pm", "noon". Returns null when the text
 * carries no time reference, so the caller can apply its own default.
 */
function extractDeadline(text: string, now: Date): { deadline: Date | null; rest: string } {
  let rest = text;

  const relative = rest.match(RELATIVE_RE);
  if (relative) {
    const rawCount = relative[1];
    const count = /^\d+$/.test(rawCount) ? parseInt(rawCount, 10) : NUMBER_WORDS[rawCount];
    const unit = relative[2].replace(/s$/, '');
    if (count && UNIT_MS[unit]) {
      return { deadline: new Date(now.getTime() + count * UNIT_MS[unit]), rest: cut(rest, relative) };
    }
  }

  // Time of day. am/pm makes "at" optional; a bare hour requires it.
  let hours: number | null = null;
  let minutes = 0;
  let hourIsExplicit = false;

  const named = rest.match(NAMED_TIME_RE);
  const ampm = rest.match(AMPM_TIME_RE);
  const bare = rest.match(BARE_TIME_RE);

  if (ampm) {
    const raw = parseInt(ampm[1], 10);
    if (raw >= 1 && raw <= 12) {
      hours = ampm[3] === 'pm' ? (raw % 12) + 12 : raw % 12;
      minutes = ampm[2] ? parseInt(ampm[2], 10) : 0;
      hourIsExplicit = true;
      rest = cut(rest, ampm);
    }
  } else if (named) {
    hours = named[1] === 'noon' ? 12 : 0;
    hourIsExplicit = true;
    rest = cut(rest, named);
  } else if (bare) {
    const raw = parseInt(bare[1], 10);
    if (raw >= 0 && raw <= 23) {
      hours = raw;
      minutes = bare[2] ? parseInt(bare[2], 10) : 0;
      rest = cut(rest, bare);
    }
  }

  // Day reference.
  let base: Date | null = null;
  const dayWord = rest.match(DAY_WORD_RE);
  const weekday = rest.match(WEEKDAY_PREFIXED_RE) ?? rest.match(WEEKDAY_TRAILING_RE);

  if (dayWord) {
    base = new Date(now);
    if (dayWord[1] === 'tomorrow') base.setDate(base.getDate() + 1);
    rest = cut(rest, dayWord);
  } else if (weekday) {
    const target = WEEKDAYS.indexOf(weekday[1]);
    base = new Date(now);
    const delta = (target - base.getDay() + 7) % 7 || 7; // always the next one
    base.setDate(base.getDate() + delta);
    rest = cut(rest, weekday);
  }

  if (hours === null && base === null) return { deadline: null, rest: text };

  const deadline = base ? new Date(base) : new Date(now);
  if (hours === null) {
    deadline.setHours(23, 59, 0, 0); // a day on its own means end of that day
  } else {
    deadline.setHours(hours, minutes, 0, 0);
    // A bare hour like "at 5" means the next 5 o'clock, morning or evening.
    if (!hourIsExplicit && hours <= 12 && deadline.getTime() <= now.getTime()) {
      deadline.setHours(hours + 12);
    }
  }

  // "at 5pm" spoken at 6pm means tomorrow, not an already-overdue task.
  if (deadline.getTime() <= now.getTime()) {
    deadline.setTime(deadline.getTime() + DAY_MS);
  }

  return { deadline, rest };
}

const tidyTitle = (text: string): string =>
  text
    .replace(/\s+/g, ' ')
    .replace(/^(?:by|on|at|due|for)\s+/, '')
    .replace(/\s+(?:by|on|at|due|for)$/, '')
    .trim();

/**
 * Turns a raw speech transcript into a task command. Case/punctuation-insensitive.
 * `now` is injectable so the date parsing is deterministic under test.
 */
export function parseCommand(transcript: string, now: Date = new Date()): VoiceCommand {
  const text = transcript.trim().toLowerCase().replace(/[.!?]+$/, '');
  if (!text) return { kind: 'unknown' };

  const markMatch = text.match(MARK_RE);
  if (markMatch) {
    const rest = markMatch[1];
    const trailing = rest.match(COMPLETE_TRAILING_RE);
    if (trailing && trailing[1].trim()) return { kind: 'complete', title: trailing[1].trim() };
    if (rest.trim()) return { kind: 'complete', title: rest.trim() };
  }

  const addMatch = text.match(ADD_RE);
  if (addMatch && addMatch[1].trim()) {
    const { priority, rest: afterPriority } = extractPriority(addMatch[1]);
    const { deadline, rest: afterDeadline } = extractDeadline(afterPriority, now);
    const title = tidyTitle(afterDeadline);
    // Everything was schedule words and no task was left — treat as unparseable
    // rather than creating a task called "".
    if (!title) return { kind: 'unknown' };
    return { kind: 'add', title, priority, deadline };
  }

  const completeMatch = text.match(COMPLETE_LEADING_RE);
  if (completeMatch && completeMatch[1].trim()) {
    return { kind: 'complete', title: completeMatch[1].trim() };
  }

  const deleteMatch = text.match(DELETE_RE);
  if (deleteMatch && deleteMatch[1].trim()) return { kind: 'delete', title: deleteMatch[1].trim() };

  return { kind: 'unknown' };
}

const normalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

const MATCH_THRESHOLD = 0.5;

/** Fuzzy-matches a spoken title against the task list. Null if no task clears the threshold. */
export function matchTask(title: string, tasks: Task[]): Task | null {
  const query = normalize(title);
  if (!query || tasks.length === 0) return null;

  const queryWords = new Set(query.split(/\s+/).filter(Boolean));
  let best: Task | null = null;
  let bestScore = 0;

  for (const task of tasks) {
    const candidate = normalize(task.title);
    if (!candidate) continue;

    let score: number;
    if (candidate === query) {
      score = 1;
    } else if (candidate.includes(query) || query.includes(candidate)) {
      score = 0.9;
    } else {
      const candidateWords = candidate.split(/\s+/).filter(Boolean);
      const overlap = candidateWords.filter(w => queryWords.has(w)).length;
      const denom = Math.max(queryWords.size, candidateWords.length);
      score = denom > 0 ? overlap / denom : 0;
    }

    if (score > bestScore) {
      bestScore = score;
      best = task;
    }
  }

  return bestScore >= MATCH_THRESHOLD ? best : null;
}
