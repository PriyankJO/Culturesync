import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as eventService from '../../services/eventService';
import { fetchCompetitions } from './competitionsSlice';
import { fetchRegistrations } from './registrationsSlice';
import { fetchHistory } from './eventHistorySlice';

export const fetchEvents = createAsyncThunk('events/fetchEvents', async (_, thunkAPI) => {
  try {
    const data = await eventService.getEvents();
    if (data.success) return data.data;
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addEvent = createAsyncThunk('events/addEvent', async (eventData, thunkAPI) => {
  try {
    const data = await eventService.createEvent(eventData);
    if (data.success) {
      thunkAPI.dispatch(fetchEvents());
      thunkAPI.dispatch(fetchHistory());
      return data.data;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const editEvent = createAsyncThunk('events/editEvent', async (eventData, thunkAPI) => {
  try {
    const data = await eventService.updateEvent(eventData.id, eventData);
    if (data.success) {
      thunkAPI.dispatch(fetchEvents());
      thunkAPI.dispatch(fetchHistory());
      return data.data;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteEvent = createAsyncThunk('events/deleteEvent', async (id, thunkAPI) => {
  try {
    const data = await eventService.deleteEvent(id);
    if (data.success) {
      thunkAPI.dispatch(fetchEvents());
      thunkAPI.dispatch(fetchCompetitions());
      thunkAPI.dispatch(fetchHistory());
      
      const role = thunkAPI.getState()?.auth?.role;
      if (role === 'admin') {
        thunkAPI.dispatch(fetchRegistrations());
      }
      return id;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    list: [],
    filter: 'All',
    loading: false,
    error: null,
  },
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
    },
    // We can still keep these optimistic UI updates or rely on re-fetching
    incrementRegisteredCount(state, action) {
      const evt = state.list.find(e => e.eventId === action.payload || e.id === action.payload);
      if (evt) evt.registered += 1;
    },
    decrementRegisteredCount(state, action) {
      const evt = state.list.find(e => e.eventId === action.payload || e.id === action.payload);
      if (evt && evt.registered > 0) evt.registered -= 1;
    },
    // Backwards compatibility for frontend reducers
    registerForEvent(state, action) {
      const { eventId } = action.payload
      const evt = state.list.find(e => e.id === eventId)
      if (evt) evt.registered += 1
    },
    cancelRegistration(state, action) {
      const eventId = action.payload
      const evt = state.list.find(e => e.id === eventId)
      if (evt && evt.registered > 0) evt.registered -= 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => { state.loading = true; })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        // Map _id to id so frontend doesn't break
        state.list = action.payload.map(e => ({ ...e, id: e.eventId }));
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilter, incrementRegisteredCount, decrementRegisteredCount, registerForEvent, cancelRegistration } = eventsSlice.actions;
export default eventsSlice.reducer;
