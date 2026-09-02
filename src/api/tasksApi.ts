import { baseApi } from './baseApi';
import type { Task, TaskStats, Priority, TaskSort, TaskStatus } from '../types/task.types';
import { priorityScore, sortBySmartScore } from '../utils/priorityScore';

export interface TaskListArgs {
  status?: TaskStatus;
  priority?: Priority;
  tag?: string;
  search?: string;
  sort?: TaskSort;
}

export interface TaskListResponse { data: (Task & { score: number })[]; count: number }

export interface CreateTaskBody {
  title: string;
  description?: string | null;
  startAt: string;
  deadline: string;
  priority: Priority;
  tags?: string[];
}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getTasks: builder.query<TaskListResponse, TaskListArgs>({
      query: args => ({ url: '/tasks', params: args }),
      providesTags: result =>
        result
          ? [...result.data.map(t => ({ type: 'Task' as const, id: t.id })),
             { type: 'Task' as const, id: 'LIST' }]
          : [{ type: 'Task' as const, id: 'LIST' }],
    }),

    getStats: builder.query<TaskStats, void>({
      query: () => '/tasks/stats',
      providesTags: [{ type: 'Stats', id: 'ALL' }],
    }),

    createTask: builder.mutation<Task, CreateTaskBody>({
      query: body => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }, { type: 'Stats', id: 'ALL' }],
    }),

    updateTask: builder.mutation<Task, { id: string; body: Partial<CreateTaskBody> }>({
      query: ({ id, body }) => ({ url: `/tasks/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) =>
        [{ type: 'Task', id }, { type: 'Task', id: 'LIST' }, { type: 'Stats', id: 'ALL' }],
    }),

    /**
     * OPTIMISTIC. The checkbox flips and the list re-sorts before the
     * network answers; a failure rolls the patch back. This is the most
     * visible piece of state management in the app — do not simplify it
     * into a plain invalidate.
     */
    toggleTask: builder.mutation<Task, string>({
      query: id => ({ url: `/tasks/${id}/toggle`, method: 'PATCH' }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const entries = tasksApi.util
          .selectInvalidatedBy(getState(), [{ type: 'Task', id: 'LIST' }])
          .filter(e => e.endpointName === 'getTasks');

        const patches = entries.map(({ originalArgs }) =>
          dispatch(
            tasksApi.util.updateQueryData('getTasks', originalArgs as TaskListArgs, draft => {
              const task = draft.data.find(t => t.id === id);
              if (!task) return;
              task.completed = !task.completed;
              task.completedAt = task.completed ? new Date().toISOString() : null;
              task.score = priorityScore(task);
              // Re-rank locally with the SAME function the server uses,
              // so the optimistic order matches the eventual server order.
              draft.data = sortBySmartScore(draft.data);
            }),
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach(p => p.undo());
        }
      },
      invalidatesTags: [{ type: 'Stats', id: 'ALL' }],
    }),

    /** OPTIMISTIC removal, paired with the undo snackbar in the UI. */
    deleteTask: builder.mutation<{ id: string; deleted: boolean }, string>({
      query: id => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const entries = tasksApi.util
          .selectInvalidatedBy(getState(), [{ type: 'Task', id: 'LIST' }])
          .filter(e => e.endpointName === 'getTasks');

        const patches = entries.map(({ originalArgs }) =>
          dispatch(
            tasksApi.util.updateQueryData('getTasks', originalArgs as TaskListArgs, draft => {
              draft.data = draft.data.filter(t => t.id !== id);
              draft.count = draft.data.length;
            }),
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach(p => p.undo());
        }
      },
      invalidatesTags: [{ type: 'Stats', id: 'ALL' }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetStatsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useToggleTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
