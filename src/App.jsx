import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import LoginPage       from './pages/LoginPage'
import Layout          from './components/Layout'
import Dashboard       from './pages/Dashboard'
import Events          from './pages/Events'
import Competitions        from './pages/Competitions'
import CompetitionInvitation from './pages/CompetitionInvitation'
import MyRegistrations from './pages/MyRegistrations'
import Students        from './pages/Students'
import Judges          from './pages/Judges'
import Results         from './pages/Results'
import Certificates    from './pages/Certificates'
import EventHistory    from './pages/EventHistory'
import Notifications   from './pages/Notifications'
import Settings        from './pages/Settings'
import Reports         from './pages/Reports'
import NotFound        from './pages/NotFound'
import ModalRouter     from './components/ModalRouter'
import Toast           from './components/Toast'
import { fetchEvents } from './store/slices/eventsSlice'
import { fetchCompetitions } from './store/slices/competitionsSlice'
import { fetchRegistrations, fetchMyRegistrations } from './store/slices/registrationsSlice'
import { fetchStudents } from './store/slices/studentsSlice'
import { fetchJudges, fetchScores } from './store/slices/judgesSlice'
import { fetchResults } from './store/slices/resultsSlice'
import { fetchHistory } from './store/slices/eventHistorySlice'
import { fetchTransactions } from './store/slices/paymentsSlice'
import { fetchMe } from './store/slices/authSlice'

// Guards routes that are admin-only in the sidebar (Layout.jsx's
// `adminOnly: true` nav items) so a student can't reach them just by
// typing the URL — without this, hiding the link was cosmetic only.
function RequireAdmin({ children }) {
  const isAdmin = useSelector(s => s.auth.role === 'admin')
  return isAdmin ? children : <Navigate to="/dashboard" replace />
}

// Same idea, inverted — "My Registrations" is a student-only page
// (Layout.jsx's `studentOnly: true` nav item), so an admin can't
// reach it just by typing the URL either.
function RequireStudent({ children }) {
  const isAdmin = useSelector(s => s.auth.role === 'admin')
  return isAdmin ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const dispatch = useDispatch()
  const { isLoggedIn, role } = useSelector(s => s.auth)

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchMe())
      dispatch(fetchEvents())
      dispatch(fetchCompetitions())
      dispatch(fetchResults())
      dispatch(fetchHistory())
      if (role === 'admin') {
        dispatch(fetchRegistrations())
        dispatch(fetchStudents())
        dispatch(fetchJudges())
        dispatch(fetchScores())
        dispatch(fetchTransactions())
      } else {
        dispatch(fetchMyRegistrations())
      }
    }
  }, [isLoggedIn, role, dispatch])

  if (!isLoggedIn) return (
    <>
      <LoginPage />
      <Toast />
    </>
  )

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/"                  element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"         element={<Dashboard />} />
          <Route path="/events"            element={<Events />} />
          <Route path="/competitions"      element={<Competitions />} />
          <Route path="/competitions/:id"  element={<CompetitionInvitation />} />
          <Route path="/my-registrations"  element={<RequireStudent><MyRegistrations /></RequireStudent>} />
          <Route path="/students"          element={<RequireAdmin><Students /></RequireAdmin>} />
          <Route path="/judges"            element={<RequireAdmin><Judges /></RequireAdmin>} />
          <Route path="/results"           element={<Results />} />
          <Route path="/certificates"      element={<Certificates />} />
          <Route path="/event-history"     element={<EventHistory />} />
          <Route path="/notice-board"      element={<Notifications />} />
          <Route path="/settings"          element={<Settings />} />
          <Route path="/reports"           element={<Reports />} />
          <Route path="*"                  element={<NotFound />} />
        </Routes>
      </Layout>
      <ModalRouter />
      <Toast />
    </>
  )
}
