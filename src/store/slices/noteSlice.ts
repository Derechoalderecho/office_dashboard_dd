import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Nota } from "@/types/cases";
import { createNote } from "@/services/noteService";

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
      const newNote = await createNote(caseId, content, userId);
      return newNote;
    } catch (error: any) {
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
        state.loading = true;
        state.error = null;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        if (action.payload) {
          state.notes.push(action.payload);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(addNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setNotes, clearNotes, clearError } = noteSlice.actions;
export default noteSlice.reducer;
