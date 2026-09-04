import type { Task } from '../types/task.types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  TaskForm: { task?: Task } | undefined; // undefined = create, task = edit
  TaskDetail: { id: string };
};

export type TabParamList = {
  Tasks: undefined;
  Calendar: undefined;
  Profile: undefined;
};
