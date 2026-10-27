import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as judgeService from '../../services/judgeService'

// ============================================================
// Judges module
// ------------------------------------------------------------
// - `list`  → the judges directory (who they are, how to reach
//   them, and which events they've been assigned to judge).
// - `marks` → every score a judge has given a participant, one
//   row per (event, sub-category, participant, judge). Kept
//   separate from `registrations.list` so a participant can be
//   scored by more than one judge without the records colliding,
//   and so Results/Certificates are untouched by this module.
//
// Attendance ("did the registered student actually show up") is
// NOT duplicated here — it already lives on each registration row
// as `attended` (see registrationsSlice.markAttendance), which is
// exactly what a judge needs before scoring someone. This slice
// just reads/writes that existing flag from the marks-entry screen.
// ============================================================

export const fetchJudges = createAsyncThunk('judges/fetchJudges', async (_, thunkAPI) => {
  try {
    const data = await judgeService.getJudges()
    if (data.success) return data.data
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const addJudge = createAsyncThunk('judges/addJudge', async (judgeData, thunkAPI) => {
  try {
    const data = await judgeService.createJudge(judgeData)
    if (data.success) {
      thunkAPI.dispatch(fetchJudges())
      return data.data
    }
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const editJudge = createAsyncThunk('judges/editJudge', async (judgeData, thunkAPI) => {
  try {
    const data = await judgeService.updateJudge(judgeData.id, judgeData)
    if (data.success) {
      thunkAPI.dispatch(fetchJudges())
      return data.data
    }
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const deleteJudge = createAsyncThunk('judges/deleteJudge', async (id, thunkAPI) => {
  try {
    const data = await judgeService.deleteJudge(id)
    if (data.success) {
      thunkAPI.dispatch(fetchJudges())
      return id
    }
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const fetchScores = createAsyncThunk('judges/fetchScores', async (params, thunkAPI) => {
  try {
    const data = await judgeService.getScores(params)
    if (data.success) return data.data
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const setMark = createAsyncThunk('judges/setMark', async (scoreData, thunkAPI) => {
  try {
    const data = await judgeService.createScore(scoreData)
    if (data.success) {
      thunkAPI.dispatch(fetchScores())
      return data.data
    }
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

const judgesSlice = createSlice({
  name: 'judges',
  initialState: {
    list: [],
    marks: [], // For this session's loaded scores
    loading: false,
    error: null,
  },
  reducers: {
    setJudgeEvents(state, action) {
      const { judgeId, eventIds } = action.payload
      const judge = state.list.find(j => j.id === judgeId)
      if (judge) judge.assignedEvents = eventIds
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJudges.fulfilled, (state, action) => {
        state.list = action.payload.map(j => ({ ...j, id: j.judgeId }))
      })
      .addCase(fetchScores.fulfilled, (state, action) => {
        state.marks = action.payload.map(s => ({ ...s, id: s.scoreId }))
      })
  }
})

export const { setJudgeEvents } = judgesSlice.actions

export const selectJudgesForEvent = (state, eventId) =>
  state.judges.list.filter(j => j.assignedEvents.includes(eventId))

export const selectMarkFor = (state, { eventId, subCategory, regNo, judgeId }) =>
  state.judges.marks.find(m =>
    m.eventId === eventId && m.subCategory === subCategory &&
    m.regNo === regNo && m.judgeId === judgeId
  ) || null

export default judgesSlice.reducer
