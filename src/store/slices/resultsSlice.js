import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as resultService from '../../services/resultService'
import { fetchHistory } from './eventHistorySlice'

export const fetchResults = createAsyncThunk('results/fetchResults', async (_, thunkAPI) => {
  try {
    const data = await resultService.getResults()
    if (data.success) return data.data
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const addResult = createAsyncThunk('results/addResult', async (resultData, thunkAPI) => {
  try {
    const data = await resultService.createResult(resultData)
    if (data.success) {
      thunkAPI.dispatch(fetchResults())
      thunkAPI.dispatch(fetchHistory())
      return data.data
    }
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

const resultsSlice = createSlice({
  name: 'results',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => { state.loading = true })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.map(r => ({ ...r, id: r.resultId }))
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export default resultsSlice.reducer
