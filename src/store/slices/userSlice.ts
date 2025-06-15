// ~/Documents/web/Agenda-AI/src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define el tipo para un usuario (debe coincidir con tu modelo de Prisma User)
interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string; // O Date, dependiendo de cómo lo manejes
}

// Define el tipo para el estado de los usuarios
interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

// Async Thunk para obtener todos los usuarios
export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        // Si la respuesta no es 2xx, lanza un error con el mensaje del servidor
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch users');
      }
      const data: User[] = await response.json();
      return data;
    } catch (error: any) {
      // Manejo de errores de red o del lado del cliente
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Aquí puedes añadir otros reducers síncronos si los necesitas
    // Por ejemplo, para limpiar el estado de error:
    clearUserError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // El mensaje de error que devolvimos con rejectWithValue
        state.users = []; // Limpiar usuarios en caso de error
      });
  },
});

export const { clearUserError } = userSlice.actions; // Exporta tus acciones síncronas
export default userSlice.reducer;