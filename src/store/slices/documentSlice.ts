import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DocumentResponse } from '@/types/documents';

interface DocumentState {
  documents: DocumentResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  loading: false,
  error: null,
};

export const setDocuments = createAsyncThunk(
  'document/setDocuments',
  async (documents: DocumentResponse[], { rejectWithValue }) => {
    try {
      return documents;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    clearDocuments: (state) => {
      state.documents = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(setDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDocuments, clearError } = documentSlice.actions;
export default documentSlice.reducer; 