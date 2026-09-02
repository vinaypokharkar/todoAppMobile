import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { TaskCard } from '../src/features/tasks/components/TaskCard';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import type { Task } from '../src/types/task.types';

const task: Task & { score?: number } = {
  id: 'task-1',
  userId: 'uid-1',
  title: 'Deploy backend to Render',
  description: 'Atlas URI + service-account env var',
  startAt: '2026-09-03T09:00:00.000Z',
  deadline: '2026-09-03T11:00:00.000Z',
  priority: 'high',
  tags: ['work', 'ship'],
  completed: false,
  completedAt: null,
  createdAt: '2026-09-01T09:12:00.000Z',
  updatedAt: '2026-09-01T09:12:00.000Z',
  score: 0.75,
};

// @testing-library/react-native v14 renders through RN's new async
// test-renderer — `render()` returns a Promise and must be awaited before
// the `screen` queries see anything.
async function renderCard(overrides: Partial<typeof task> = {}, onToggle = jest.fn(), onPress = jest.fn()) {
  await render(
    <ThemeProvider>
      <TaskCard task={{ ...task, ...overrides }} onToggle={onToggle} onPress={onPress} />
    </ThemeProvider>,
  );
  return { onToggle, onPress };
}

describe('TaskCard', () => {
  it('renders the task title', async () => {
    await renderCard();
    expect(screen.getByText('Deploy backend to Render')).toBeTruthy();
  });

  it('exposes accessibilityState.checked on the checkbox, reflecting completion', async () => {
    await renderCard({ completed: true });
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.props.accessibilityState).toMatchObject({ checked: true });
  });

  it('calls onToggle with the task id when the checkbox is pressed', async () => {
    const { onToggle } = await renderCard();
    fireEvent.press(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('task-1');
  });

  it('calls onPress with the task id when the card is pressed', async () => {
    const { onPress } = await renderCard();
    fireEvent.press(screen.getByRole('button', { name: /Deploy backend to Render/ }));
    expect(onPress).toHaveBeenCalledWith('task-1');
  });
});
