import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as competitionService from '../../services/competitionService';

export const fetchCompetitions = createAsyncThunk('competitions/fetchCompetitions', async (_, thunkAPI) => {
  try {
    const data = await competitionService.getCompetitions();
    if (data.success) return data.data;
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addCompetition = createAsyncThunk('competitions/addCompetition', async (compData, thunkAPI) => {
  try {
    const data = await competitionService.createCompetition(compData);
    if (data.success) {
      thunkAPI.dispatch(fetchCompetitions());
      return data.data;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const editCompetition = createAsyncThunk('competitions/editCompetition', async (compData, thunkAPI) => {
  try {
    const data = await competitionService.updateCompetition(compData.id, compData);
    if (data.success) {
      thunkAPI.dispatch(fetchCompetitions());
      return data.data;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteCompetition = createAsyncThunk('competitions/deleteCompetition', async (id, thunkAPI) => {
  try {
    const data = await competitionService.deleteCompetition(id);
    if (data.success) {
      thunkAPI.dispatch(fetchCompetitions());
      return id;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const publishCompetition = createAsyncThunk('competitions/publishCompetition', async (id, thunkAPI) => {
  try {
    const data = await competitionService.updateCompetition(id, { status: 'published', publishedAt: new Date().toISOString() });
    if (data.success) {
      thunkAPI.dispatch(fetchCompetitions());
      return data.data;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const unpublishCompetition = createAsyncThunk('competitions/unpublishCompetition', async (id, thunkAPI) => {
  try {
    const data = await competitionService.updateCompetition(id, { status: 'draft', publishedAt: null });
    if (data.success) {
      thunkAPI.dispatch(fetchCompetitions());
      return data.data;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const competitionsSlice = createSlice({
  name: 'competitions',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompetitions.pending, (state) => { state.loading = true; })
      .addCase(fetchCompetitions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.map(c => ({ ...c, id: c.competitionId }));
      })
      .addCase(fetchCompetitions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const selectCompetitionsForEvent = (state, eventId) =>
  state.competitions.list.filter(c => c.eventId === eventId);

export const selectCompetitionById = (state, id) =>
  state.competitions.list.find(c => c.id === id);

export default competitionsSlice.reducer;
