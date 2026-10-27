import { configureStore } from '@reduxjs/toolkit'
import authReducer          from './slices/authSlice'
import eventsReducer        from './slices/eventsSlice'
import studentsReducer      from './slices/studentsSlice'
import resultsReducer       from './slices/resultsSlice'
import uiReducer            from './slices/uiSlice'
import toastReducer         from './slices/toastSlice'
import notificationsReducer from './slices/notificationsSlice'
import registrationsReducer from './slices/registrationsSlice'
import competitionsReducer  from './slices/competitionsSlice'
import eventHistoryReducer  from './slices/eventHistorySlice'
import judgesReducer        from './slices/judgesSlice'
import paymentsReducer      from './slices/paymentsSlice'

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    events:        eventsReducer,
    payments:      paymentsReducer,
    students:      studentsReducer,
    results:       resultsReducer,
    ui:            uiReducer,
    toast:         toastReducer,
    notifications: notificationsReducer,
    registrations: registrationsReducer,
    competitions:  competitionsReducer,
    eventHistory:  eventHistoryReducer,
    judges:        judgesReducer,
  },
})
