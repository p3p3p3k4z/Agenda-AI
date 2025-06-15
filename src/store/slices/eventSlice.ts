// ~/Documents/web/Agenda-AI/src/store/slices/eventSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define el tipo para un evento
export interface Event {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string; // Usar string para la fecha/hora recibida de la API, luego convertirla si es necesario para el calendario
  endTime: string | null;
  isAllDay: boolean;
  reminderTime: string | null;
  category: string | null;
  priority: number;
  createdAt: string;
  updatedAt: string;
  user?: { // Opcional, ya que lo incluimos en la respuesta GET
    id: number;
    username: string;
  };
}

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  loading: false,
  error: null,
};

// Async Thunk para obtener eventos (opcionalmente filtrado por userId)
export const fetchEvents = createAsyncThunk<Event[], number | void, { rejectValue: string }>(
  'events/fetchEvents',
  async (userId, { rejectWithValue }) => {
    try {
      const url = userId ? `/api/events?userId=${userId}` : '/api/events';
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch events');
      }
      const data: Event[] = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async Thunk para crear un evento
export const createEvent = createAsyncThunk<Event, Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'user'>, { rejectValue: string }>(
  'events/createEvent',
  async (newEventData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEventData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create event');
      }
      const data: Event = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearEventError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.events = [];
      })
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = false;
        state.events.push(action.payload); // Añade el nuevo evento al estado
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEventError } = eventSlice.actions;
export default eventSlice.reducer;