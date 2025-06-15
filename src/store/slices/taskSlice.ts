// ~/Documents/web/Agenda-AI/src/store/slices/taskSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define el tipo para una tarea
export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  dueDate: string | null; // Usar string para la fecha
  dueTime: string | null; // Usar string para la hora
  isCompleted: boolean;
  priority: number;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { // Opcional, ya que lo incluimos en la respuesta GET
    id: number;
    username: string;
  };
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

// Async Thunk para obtener tareas (opcionalmente filtrado por userId)
export const fetchTasks = createAsyncThunk<Task[], number | void, { rejectValue: string }>(
  'tasks/fetchTasks',
  async (userId, { rejectWithValue }) => {
    try {
      const url = userId ? `/api/tasks?userId=${userId}` : '/api/tasks';
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch tasks');
      }
      const data: Task[] = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async Thunk para crear una tarea
export const createTask = createAsyncThunk<Task, Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'user'>, { rejectValue: string }>(
  'tasks/createTask',
  async (newTaskData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create task');
      }
      const data: Task = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async Thunk para actualizar una tarea
export const updateTask = createAsyncThunk<Task, Partial<Task> & { id: number }, { rejectValue: string }>(
    'tasks/updateTask',
    async (taskData, { rejectWithValue }) => {
      const { id, ...rest } = taskData;
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rest),
        });
        if (!response.ok) {
          const errorData = await response.json();
          return rejectWithValue(errorData.message || 'Failed to update task');
        }
        const data: Task = await response.json();
        return data;
      } catch (error: any) {
        return rejectWithValue(error.message || 'Network error');
      }
    }
);

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.tasks = [];
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.tasks.push(action.payload); // Añade la nueva tarea al estado
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        // Actualiza la tarea en el estado
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;