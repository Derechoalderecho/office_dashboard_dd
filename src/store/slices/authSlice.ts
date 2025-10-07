import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { get } from '@/utils/apiUtils';

// Tipos según respuesta de /usuarios/me
interface BackendUserRole {
  id: number;
  nombre: string;
}

interface BackendAreaAtencion {
  id: number;
  nombre: string;
  created_at: string;
  modified_at: string;
  deleted_at: string | null;
  status: boolean;
}

interface BackendUniversidad {
  id: number;
  nombre: string;
  id_municipio: number;
  created_at: string;
  deleted_at: string | null;
  status: boolean;
}

export interface ApiUserData {
  id: number;
  id_usuario_firebase: string;
  num_documento: string;
  tipo_documento: string;
  email: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  status: boolean;
  created_at: string;
  modified_at: string;
  rol: BackendUserRole;
  areas_atencion: BackendAreaAtencion[];
  universidades: BackendUniversidad[];
}

interface AuthState {
  user: ApiUserData | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  token: null,
  initialized: false,
};

// Thunk para obtener datos del usuario autenticado desde /usuarios/me
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const user = await get<ApiUserData>('/usuarios/me');
      return user;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error al obtener datos del usuario');
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Data
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.user = action.payload as ApiUserData;
        state.loading = false;
        state.error = null;
        state.initialized = true;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Marcamos initialized para evitar bucles hasta que cambie el estado de autenticación
        state.initialized = true;
      })
      // Sign In (solo estado de carga)
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
        state.token = null;
        state.initialized = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setToken, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;