import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Nota } from "@/types/cases";
import { createNote } from "@/services/noteService";
import { logger } from "@/utils/logUtils";

interface NoteState {
  notes: Nota[];
  loading: boolean;
  error: string | null;
}

const initialState: NoteState = {
  notes: [],
  loading: false,
  error: null,
};

export const addNote = createAsyncThunk(
  "note/addNote",
  async (
    {
      caseId,
      content,
      userId,
    }: { caseId: number; content: string; userId: number },
    { rejectWithValue }
  ) => {
    try {
      logger.info(`[Redux] Iniciando acción addNote para caso ID=${caseId}`);
      
      const newNote = await createNote(caseId, content, userId);
      
      if (newNote) {
        logger.info(`[Redux] Nota creada exitosamente: ID=${newNote.id_nota}`);
      } else {
        logger.warn(`[Redux] La función createNote devolvió null`);
      }
      
      return newNote;
    } catch (error: any) {
      logger.error(`[Redux] Error en acción addNote:`, error);
      return rejectWithValue(error.message);
    }
  }
);

const noteSlice = createSlice({
  name: "note",
  initialState,
  reducers: {
    setNotes: (state, action) => {
      state.notes = action.payload;
      state.error = null;
    },
    clearNotes: (state) => {
      state.notes = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addNote.pending, (state) => {
        logger.debug(`[Redux] Estado pending para addNote`);
        state.loading = true;
        state.error = null;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        if (action.payload) {
          logger.debug(`[Redux] Añadiendo nota ID=${action.payload.id_nota} al estado`);
          state.notes.push(action.payload);
        } else {
          logger.warn(`[Redux] No se recibió payload en addNote.fulfilled`);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(addNote.rejected, (state, action) => {
        logger.error(`[Redux] Error en addNote: ${action.payload}`);
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setNotes, clearNotes, clearError } = noteSlice.actions;
export default noteSlice.reducer;
