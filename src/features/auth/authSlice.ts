// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, Permission, UserLogin, UserCreate } from '../../types';
import instance from '../../api/axios';

// Get user from localStorage
const userFromStorage: User | null = localStorage.getItem('user') 
  ? JSON.parse(localStorage.getItem('user') || '{}')
  : null;

const initialState: AuthState = {
  user: userFromStorage,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  permissions: [],
};

// Register user
export const register = createAsyncThunk<
  { user: User }, 
  UserCreate, 
  { rejectValue: string }
>('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await instance.post('/api/auth/register', userData);
    
    if (response.data && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    const message = 
      (error.response && 
        error.response.data && 
        error.response.data.message) || 
      error.message || 
      error.toString();
      
    return thunkAPI.rejectWithValue(message);
  }
});

// Login user
export const login = createAsyncThunk<
  { user: User }, 
  UserLogin, 
  { rejectValue: string }
>('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await instance.post('/api/auth/login', userData);
    
    if (response.data && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error: any) {
    const message = 
      (error.response && 
        error.response.data && 
        error.response.data.message) || 
      error.message || 
      error.toString();
      
    return thunkAPI.rejectWithValue(message);
  }
});

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user');
});

// Get current user permissions
export const getUserPermissions = createAsyncThunk<
  { permissions: Permission[] }, 
  void, 
  { rejectValue: string, state: { auth: AuthState } }
>('auth/permissions', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user?.token;
    
    if (!token) {
      return thunkAPI.rejectWithValue('No auth token found');
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    const response = await instance.get('/api/permissions/me/permissions', config);
    if (response.data && response.data.permissions) {
      localStorage.setItem('permissions', JSON.stringify(response.data.permissions));
    }
    return response.data;
  } catch (error: any) {
    const message = 
      (error.response && 
        error.response.data && 
        error.response.data.message) || 
      error.message || 
      error.toString();
      
    return thunkAPI.rejectWithValue(message);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.permissions = [];
      })
      .addCase(getUserPermissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserPermissions.fulfilled, (state, action: PayloadAction<{ permissions: Permission[] }>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.permissions = action.payload.permissions;
      })
      .addCase(getUserPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;