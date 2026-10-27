import { createSlice } from '@reduxjs/toolkit'
import { loginUser, logout } from './authSlice'

const KEY_PREFIX = 'culturesync_notifications_read'

// Each signed-in person gets their own storage bucket — admins share one
// (there's one staff account), students are scoped by regNo — so two
// different people using the same browser never inherit each other's
// "already read" notifications.
function storageKeyFor(role, regNo) {
  return role === 'admin' ? `${KEY_PREFIX}__admin` : `${KEY_PREFIX}__student__${regNo || 'unknown'}`
}

function loadFor(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    /* fall through */
  }
  return []
}

function persist(key, readIds) {
  if (!key) return
  try {
    window.localStorage.setItem(key, JSON.stringify(readIds))
  } catch {
    /* storage unavailable — noop */
  }
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    readIds: [],
    // Which user's bucket is currently loaded — null until someone logs
    // in, since we don't know who "read" state belongs to before that.
    storageKey: null,
  },
  reducers: {
    markNotifRead(state, action) {
      if (!state.readIds.includes(action.payload)) {
        state.readIds.push(action.payload)
        persist(state.storageKey, state.readIds)
      }
    },
    markAllNotifsRead(state, action) {
      const allIds = action.payload // array of ids currently visible
      state.readIds = Array.from(new Set([...state.readIds, ...allIds]))
      persist(state.storageKey, state.readIds)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        const key = storageKeyFor(action.payload.role, action.payload.user?.regNo)
        state.storageKey = key
        state.readIds = loadFor(key)
      })
      .addCase(logout, (state) => {
        state.storageKey = null
        state.readIds = []
      })
  },
})

export const { markNotifRead, markAllNotifsRead } = notificationsSlice.actions
export default notificationsSlice.reducer
