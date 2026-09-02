import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Priority, TaskSort, TaskStatus } from '../../types/task.types';

interface UiState {
  status: TaskStatus;
  priority: Priority | null;
  tag: string | null;
  search: string;
  sort: TaskSort;
}

const initialState: UiState = {
  status: 'all', priority: null, tag: null, search: '', sort: 'smart',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setStatus:   (s, a: PayloadAction<TaskStatus>) => { s.status = a.payload; },
    setPriority: (s, a: PayloadAction<Priority | null>) => { s.priority = a.payload; },
    setTag:      (s, a: PayloadAction<string | null>) => { s.tag = a.payload; },
    setSearch:   (s, a: PayloadAction<string>) => { s.search = a.payload; },
    setSort:     (s, a: PayloadAction<TaskSort>) => { s.sort = a.payload; },
    clearFilters: () => initialState,
  },
});

export const { setStatus, setPriority, setTag, setSearch, setSort, clearFilters } = uiSlice.actions;
export default uiSlice.reducer;
