import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, getMe, updateProfile } from '../../services/authService';
import api from '../../services/api';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, thunkAPI) => {
    try {
      const data = await login(credentials);
      if (data.success) {
        return data.data;
      }
      return thunkAPI.rejectWithValue(data.message);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, thunkAPI) => {
    try {
      const data = await getMe();
      if (data.success) {
        return data.data;
      }
      return thunkAPI.rejectWithValue(data.message);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, thunkAPI) => {
    try {
      const data = await updateProfile(profileData);
      if (data.success) {
        return data.data;
      }
      return thunkAPI.rejectWithValue(data.message);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addAdminUser = createAsyncThunk('auth/addAdminUser', async (adminData, thunkAPI) => {
  try {
    const response = await api.post('/auth/add-admin', adminData);
    if (response.data.success) return response.data.data;
    return thunkAPI.rejectWithValue(response.data.message);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Get user from sessionStorage if exists
const userFromStorage = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: !!userFromStorage,
    role: userFromStorage ? userFromStorage.role.toLowerCase() : 'student',
    user: userFromStorage,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.isLoggedIn = false;
      state.role = 'student';
      state.user = null;
      sessionStorage.removeItem('user');
    },
    setAvatar(state, action) {
      if (state.user) {
        state.user.avatar = action.payload;
        sessionStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    clearAvatar(state) {
      if (state.user) {
        state.user.avatar = null;
        sessionStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.role = action.payload.role.toLowerCase();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        if (action.payload.role) {
          state.role = action.payload.role.toLowerCase();
        }
        sessionStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        if (action.payload.role) {
          state.role = action.payload.role.toLowerCase();
        }
        sessionStorage.setItem('user', JSON.stringify(state.user));
      });
  }
});

export const { logout, setAvatar, clearAvatar } = authSlice.actions;
export default authSlice.reducer;
