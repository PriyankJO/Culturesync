import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { fetchMyRegistrations, fetchRegistrations } from './registrationsSlice'

export const fetchTransactions = createAsyncThunk('payments/fetchTransactions', async (_, thunkAPI) => {
  try {
    const response = await api.get('/payments')
    if (response.data.success) return response.data.data
    return thunkAPI.rejectWithValue(response.data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const processPaymentTransaction = createAsyncThunk('payments/processPayment', async (paymentData, thunkAPI) => {
  try {
    const response = await api.post('/payments', paymentData)
    if (response.data.success) {
      thunkAPI.dispatch(fetchMyRegistrations())
      if (thunkAPI.getState().auth.role === 'admin') {
        thunkAPI.dispatch(fetchRegistrations())
      }
      return response.data.data
    }
    return thunkAPI.rejectWithValue(response.data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

const paymentsSlice = createSlice({
  name: 'payments',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.map(p => ({ ...p, id: p.txnId }))
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(processPaymentTransaction.fulfilled, (state, action) => {
        state.list.push({ ...action.payload, id: action.payload.txnId })
      })
  }
})

export const selectAllTransactions = (state) => state.payments.list

export default paymentsSlice.reducer
