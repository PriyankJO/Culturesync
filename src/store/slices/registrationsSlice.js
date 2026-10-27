import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as registrationService from '../../services/registrationService';
import { fetchHistory } from './eventHistorySlice';

export const fetchRegistrations = createAsyncThunk('registrations/fetchRegistrations', async (_, thunkAPI) => {
  try {
    const data = await registrationService.getRegistrations();
    if (data.success) return data.data;
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchMyRegistrations = createAsyncThunk('registrations/fetchMyRegistrations', async (_, thunkAPI) => {
  try {
    const data = await registrationService.getMyRegistrations();
    if (data.success) return data.data;
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addRegistration = createAsyncThunk('registrations/addRegistration', async (regData, thunkAPI) => {
  try {
    const data = await registrationService.createRegistration(regData);
    if (data.success) {
      thunkAPI.dispatch(fetchRegistrations());
      thunkAPI.dispatch(fetchMyRegistrations());
      thunkAPI.dispatch(fetchHistory());
      return data.data;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const removeRegistration = createAsyncThunk('registrations/removeRegistration', async (id, thunkAPI) => {
  try {
    const data = await registrationService.deleteRegistration(id);
    if (data.success) {
      thunkAPI.dispatch(fetchRegistrations());
      thunkAPI.dispatch(fetchMyRegistrations());
      thunkAPI.dispatch(fetchHistory());
      return id;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const markAttendance = createAsyncThunk('registrations/markAttendance', async ({ id, attended }, thunkAPI) => {
  try {
    const data = await registrationService.markAttendance(id, attended);
    if (data.success) {
      thunkAPI.dispatch(fetchRegistrations());
      return data.data;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const confirmRegistration = createAsyncThunk('registrations/confirmRegistration', async (payload, thunkAPI) => {
  try {
    const { id, ...rest } = payload;
    const data = await registrationService.updateRegistration(id, { status: 'confirmed', ...rest });
    if (data.success) {
      thunkAPI.dispatch(fetchRegistrations());
      thunkAPI.dispatch(fetchMyRegistrations());
      return data.data;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState: {
    list: [], // All registrations (admin view)
    myList: [], // My registrations (student view)
    loading: false,
    error: null,
  },
  reducers: {
    removeRegistrationByEventAndRegNo(state, action) {
      const { eventId, regNo } = action.payload;
      state.list = state.list.filter(r => !(r.eventId === eventId && r.regNo === regNo));
      state.myList = state.myList.filter(r => !(r.eventId === eventId && r.regNo === regNo));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegistrations.pending, (state) => { state.loading = true; })
      .addCase(fetchRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.map(r => ({ ...r, id: r.regId }));
      })
      .addCase(fetchRegistrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyRegistrations.pending, (state) => { state.loading = true; })
      .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.myList = action.payload.map(r => ({ ...r, id: r.regId }));
      })
      .addCase(fetchMyRegistrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const selectRegistrationsForEvent = (state, eventId) => {
  const list = state.auth.role === 'admin' ? state.registrations.list : state.registrations.myList;
  return list.filter(r => r.eventId === eventId);
};

export const selectRegisteredCount = (state, eventId) =>
  selectRegistrationsForEvent(state, eventId).length;

export const selectMyRegistrations = (state) => state.registrations.myList;

export const selectAllRegistrations = (state) => state.auth.role === 'admin' ? state.registrations.list : state.registrations.myList;

export const { removeRegistrationByEventAndRegNo } = registrationsSlice.actions;

export default registrationsSlice.reducer;
