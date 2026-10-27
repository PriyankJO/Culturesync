import { createSlice } from '@reduxjs/toolkit'

let nextId = 1

const toastSlice = createSlice({
  name: 'toast',
  initialState: { items: [] },
  reducers: {
    addToast(state, action) {
      state.items.push({
        id: nextId++,
        type: action.payload.type || 'info',   // 'success' | 'error' | 'info' | 'warning'
        message: action.payload.message,
        duration: action.payload.duration ?? 3500,
      })
    },
    removeToast(state, action) {
      state.items = state.items.filter(t => t.id !== action.payload)
    },
  },
})

export const { addToast, removeToast } = toastSlice.actions
export default toastSlice.reducer

/* Helper thunks */
export const toast = {
  success: (message, duration) => addToast({ type: 'success', message, duration }),
  error:   (message, duration) => addToast({ type: 'error',   message, duration }),
  info:    (message, duration) => addToast({ type: 'info',    message, duration }),
  warning: (message, duration) => addToast({ type: 'warning', message, duration }),
}
