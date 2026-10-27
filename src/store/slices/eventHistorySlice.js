import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as historyService from '../../services/historyService'

export const fetchHistory = createAsyncThunk('eventHistory/fetchHistory', async (_, thunkAPI) => {
  try {
    const data = await historyService.getHistory()
    if (data.success) return data.data
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

const eventHistorySlice = createSlice({
  name: 'eventHistory',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => { state.loading = true })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.map(h => ({ ...h, id: h._id || h.histId }))
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export default eventHistorySlice.reducer
