// ~/Documents/web/Agenda-AI/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import eventReducer from './slices/eventSlice';
import taskReducer from './slices/taskSlice';

export const store = configureStore({
  reducer: {
    users: userReducer,
    events: eventReducer,
    tasks: taskReducer,
    // Aquí se agregarían otros reducers si los tuvieras
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {users: UsersState, events: EventsState, tasks: TasksState}
export type AppDispatch = typeof store.dispatch;