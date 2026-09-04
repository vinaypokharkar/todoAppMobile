import { parseCommand, matchTask } from '../src/features/tasks/voiceCommand';
import type { Task } from '../src/types/task.types';

const task = (id: string, title: string): Task => ({
  id,
  userId: 'u1',
  title,
  description: null,
  startAt: '2026-01-01T00:00:00.000Z',
  deadline: '2026-01-01T01:00:00.000Z',
  priority: 'medium',
  tags: [],
  completed: false,
  completedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

// Wed 3 Sep 2026, 10:00 local — fixed so date parsing is deterministic.
const NOW = new Date(2026, 8, 3, 10, 0, 0, 0);

describe('parseCommand', () => {
  it.each([
    ['add buy milk', 'buy milk'],
    ['create buy milk', 'buy milk'],
    ['add task buy milk', 'buy milk'],
    ['Add Buy Milk.', 'buy milk'],
  ])('%s -> add', (input, title) => {
    expect(parseCommand(input, NOW)).toEqual({
      kind: 'add',
      title,
      priority: 'medium',
      deadline: null,
    });
  });

  it.each([
    ['complete buy milk', { kind: 'complete', title: 'buy milk' }],
    ['finish buy milk', { kind: 'complete', title: 'buy milk' }],
    ['done buy milk', { kind: 'complete', title: 'buy milk' }],
    ['check off buy milk', { kind: 'complete', title: 'buy milk' }],
    ['mark buy milk done', { kind: 'complete', title: 'buy milk' }],
    ['mark buy milk as done', { kind: 'complete', title: 'buy milk' }],
    ['mark buy milk complete', { kind: 'complete', title: 'buy milk' }],
  ])('%s -> complete', (input, expected) => {
    expect(parseCommand(input)).toEqual(expected);
  });

  it.each([
    ['delete buy milk', { kind: 'delete', title: 'buy milk' }],
    ['remove buy milk', { kind: 'delete', title: 'buy milk' }],
    ['trash buy milk', { kind: 'delete', title: 'buy milk' }],
  ])('%s -> delete', (input, expected) => {
    expect(parseCommand(input)).toEqual(expected);
  });

  it.each(['', '   ', 'blah blah', 'add', 'delete', 'hello there', 'add tomorrow'])(
    '%s -> unknown',
    input => {
      expect(parseCommand(input, NOW)).toEqual({ kind: 'unknown' });
    },
  );
});

describe('parseCommand — priority', () => {
  it.each([
    ['add buy milk high priority', 'high'],
    ['add buy milk low priority', 'low'],
    ['add buy milk urgent priority', 'urgent'],
    ['add urgent buy milk', 'urgent'],
    ['add buy milk priority high', 'high'],
  ])('%s -> %s', (input, priority) => {
    const result = parseCommand(input, NOW);
    expect(result).toMatchObject({ kind: 'add', title: 'buy milk', priority });
  });

  it('defaults to medium when unspoken', () => {
    expect(parseCommand('add buy milk', NOW)).toMatchObject({ priority: 'medium' });
  });
});

describe('parseCommand — deadline', () => {
  const deadlineOf = (input: string): Date => {
    const result = parseCommand(input, NOW);
    if (result.kind !== 'add' || !result.deadline) throw new Error(`no deadline for "${input}"`);
    return result.deadline;
  };

  it('parses "in N units"', () => {
    expect(deadlineOf('add buy milk in 2 hours')).toEqual(new Date(2026, 8, 3, 12, 0));
    expect(deadlineOf('add buy milk in 30 minutes')).toEqual(new Date(2026, 8, 3, 10, 30));
    expect(deadlineOf('add buy milk in 3 days')).toEqual(new Date(2026, 8, 6, 10, 0));
  });

  it('parses spelled-out counts', () => {
    expect(deadlineOf('add buy milk in two hours')).toEqual(new Date(2026, 8, 3, 12, 0));
  });

  it('parses a day on its own as end of that day', () => {
    expect(deadlineOf('add buy milk tomorrow')).toEqual(new Date(2026, 8, 4, 23, 59));
    expect(deadlineOf('add buy milk today')).toEqual(new Date(2026, 8, 3, 23, 59));
  });

  it('parses day + time', () => {
    expect(deadlineOf('add buy milk tomorrow at 5pm')).toEqual(new Date(2026, 8, 4, 17, 0));
    expect(deadlineOf('add buy milk tomorrow at 9:30am')).toEqual(new Date(2026, 8, 4, 9, 30));
  });

  it('parses a time alone as today when still ahead', () => {
    expect(deadlineOf('add buy milk at 5pm')).toEqual(new Date(2026, 8, 3, 17, 0));
  });

  it('rolls a time that has already passed to tomorrow', () => {
    expect(deadlineOf('add buy milk at 9am')).toEqual(new Date(2026, 8, 4, 9, 0));
  });

  it('reads a bare hour as the next occurrence', () => {
    // 5 has passed as 05:00, so it means 17:00 today.
    expect(deadlineOf('add buy milk at 5')).toEqual(new Date(2026, 8, 3, 17, 0));
  });

  it('parses noon and midnight', () => {
    expect(deadlineOf('add buy milk at noon')).toEqual(new Date(2026, 8, 3, 12, 0));
    expect(deadlineOf('add buy milk at midnight')).toEqual(new Date(2026, 8, 4, 0, 0));
  });

  it('parses weekdays as the next occurrence', () => {
    // NOW is a Thursday; "on friday" is the next day.
    expect(deadlineOf('add buy milk on friday')).toEqual(new Date(2026, 8, 4, 23, 59));
    expect(deadlineOf('add buy milk next monday at 9am')).toEqual(new Date(2026, 8, 7, 9, 0));
  });

  it('reads a trailing weekday but leaves one mid-title alone', () => {
    expect(parseCommand('add team sync friday', NOW)).toMatchObject({ title: 'team sync' });
    expect(parseCommand('add friday retro', NOW)).toMatchObject({
      title: 'friday retro',
      deadline: null,
    });
  });

  it('combines priority and deadline, keeping a clean title', () => {
    expect(parseCommand('add submit report tomorrow at 5pm high priority', NOW)).toEqual({
      kind: 'add',
      title: 'submit report',
      priority: 'high',
      deadline: new Date(2026, 8, 4, 17, 0),
    });
  });

  it('leaves deadline null when no time is spoken', () => {
    expect(parseCommand('add buy milk', NOW)).toMatchObject({ deadline: null });
  });
});

describe('matchTask', () => {
  const tasks = [task('1', 'Buy milk'), task('2', 'Buy bread'), task('3', 'Call dentist')];

  it('matches exact title case-insensitively', () => {
    expect(matchTask('buy milk', tasks)?.id).toBe('1');
  });

  it('matches on substring', () => {
    expect(matchTask('milk', tasks)?.id).toBe('1');
  });

  it('matches on partial word overlap above threshold', () => {
    expect(matchTask('call the dentist', tasks)?.id).toBe('3');
  });

  it('returns null below the match threshold', () => {
    expect(matchTask('go to the gym', tasks)).toBeNull();
  });

  it('returns null for an empty task list', () => {
    expect(matchTask('buy milk', [])).toBeNull();
  });

  it('returns null for an empty query', () => {
    expect(matchTask('', tasks)).toBeNull();
  });

  it('is deterministic on a tie (first match wins)', () => {
    const tied = [task('a', 'Buy milk'), task('b', 'Buy milk')];
    expect(matchTask('buy milk', tied)?.id).toBe('a');
  });
});
