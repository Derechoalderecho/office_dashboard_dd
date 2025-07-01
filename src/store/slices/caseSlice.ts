import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CompleteCaseData } from '@/types/cases';
import { fetchCompleteCaseById } from '@/services/completeUserCasesService';

interface CaseState {
  currentCase: CompleteCaseData | null;
  loading: boolean;
  error: string | null;
}

const initialState: CaseState = {
  currentCase: null,
  loading: false,
  error: null,
};

export const fetchCase = createAsyncThunk(
  'case/fetchCase',
  async (caseId: number, { rejectWithValue }) => {
    try {
      const casesData = await fetchCompleteCaseById(caseId);
      // fetchCompleteCaseById devuelve un array, tomamos el primer elemento
      return casesData[0] || null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const caseSlice = createSlice({
  name: 'case',
  initialState,
  reducers: {
    clearCase: (state) => {
      state.currentCase = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCase.fulfilled, (state, action) => {
        state.currentCase = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCase, clearError } = caseSlice.actions;
export default caseSlice.reducer; 