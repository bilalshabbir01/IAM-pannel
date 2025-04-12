// src/features/users/usersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserCreate } from '../../types';
import instance from '../../api/axios';

interface UsersState {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

const initialState: UsersState = {
  users: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all users
export const getUsers = createAsyncThunk<
  { users: User[] }, 
  void, 
  { rejectValue: string }
>('users/getAll', async (_, thunkAPI) => {
  try {
    const response = await instance.get('/api/users');
    console.log(response.data, "response.dataresponse.dataresponse.dataresponse.dataresponse.data")
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

// Create new user
export const createUser = createAsyncThunk<
  User, 
  UserCreate, 
  { rejectValue: string }
>('users/create', async (userData, thunkAPI) => {
  try {
    const response = await instance.post('/api/users', userData);
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

// Update user
export const updateUser = createAsyncThunk<
  User, 
  User, 
  { rejectValue: string }
>('users/update', async (userData, thunkAPI) => {
  try {
    const response = await instance.put(`/api/users/${userData.id}`, userData);
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

// Delete user
export const deleteUser = createAsyncThunk<
  number, 
  number, 
  { rejectValue: string }
>('users/delete', async (userId, thunkAPI) => {
  try {
    await instance.delete(`/api/users/${userId}`);
    return userId;
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

export const usersSlice = createSlice({
  name: 'users',
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
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action: PayloadAction<{ users: User[] }>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload.users;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = state.users.map((user) => 
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = usersSlice.actions;
export default usersSlice.reducer;