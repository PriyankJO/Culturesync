import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as studentService from '../../services/studentService'

export const fetchStudents = createAsyncThunk('students/fetchStudents', async (_, thunkAPI) => {
  try {
    const data = await studentService.getStudents()
    if (data.success) return data.data
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const addStudent = createAsyncThunk('students/addStudent', async (studentData, thunkAPI) => {
  try {
    const data = await studentService.createStudent(studentData)
    if (data.success) {
      thunkAPI.dispatch(fetchStudents())
      return data.data
    }
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const editStudent = createAsyncThunk('students/editStudent', async (studentData, thunkAPI) => {
  try {
    const data = await studentService.updateStudent(studentData._id || studentData.id, studentData)
    if (data.success) {
      thunkAPI.dispatch(fetchStudents())
      return data.data
    }
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const deleteStudent = createAsyncThunk('students/deleteStudent', async (id, thunkAPI) => {
  try {
    const data = await studentService.deleteStudent(id)
    if (data.success) {
      thunkAPI.dispatch(fetchStudents())
      return id
    }
    return thunkAPI.rejectWithValue(data.message)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
  }
})

const studentsSlice = createSlice({
  name: 'students',
  initialState: {
    list: [],
    departmentFilter: 'All',
    searchQuery: '',
    loading: false,
    error: null,
  },
  reducers: {
    setDepartmentFilter(state, action) {
      state.departmentFilter = action.payload
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => { state.loading = true })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.map(s => ({ ...s, id: s._id || s.regNo }))
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { setDepartmentFilter, setSearchQuery } = studentsSlice.actions
export default studentsSlice.reducer
