// src/features/modules/modulesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Module } from '../../types';
import instance from '../../api/axios';

interface ModulesState {
  modules: Module[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

const initialState: ModulesState = {
  modules: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all modules
export const getModules = createAsyncThunk<
  { modules: Module[] }, 
  void, 
  { rejectValue: string }
>('modules/getAll', async (_, thunkAPI) => {
  try {
    const response = await instance.get('/api/modules');
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

// Create new module
export const createModule = createAsyncThunk<
  Module, 
  { name: string }, 
  { rejectValue: string }
>('modules/create', async (moduleData, thunkAPI) => {
  try {
    const response = await instance.post('/api/modules', moduleData);
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

// Update module
export const updateModule = createAsyncThunk<
  Module, 
  Module, 
  { rejectValue: string }
>('modules/update', async (moduleData, thunkAPI) => {
  try {
    const response = await instance.put(`/api/modules/${moduleData.id}`, moduleData);
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

// Delete module
export const deleteModule = createAsyncThunk<
  number, 
  number, 
  { rejectValue: string }
>('modules/delete', async (moduleId, thunkAPI) => {
  try {
    await instance.delete(`/api/modules/${moduleId}`);
    return moduleId;
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

export const modulesSlice = createSlice({
  name: 'modules',
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
      .addCase(getModules.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getModules.fulfilled, (state, action: PayloadAction<{ modules: Module[] }>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.modules = action.payload.modules;
      })
      .addCase(getModules.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(createModule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createModule.fulfilled, (state, action: PayloadAction<Module>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.modules.push(action.payload);
      })
      .addCase(createModule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(updateModule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateModule.fulfilled, (state, action: PayloadAction<Module>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.modules = state.modules.map((module) => 
          module.id === action.payload.id ? action.payload : module
        );
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deleteModule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteModule.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.modules = state.modules.filter((module) => module.id !== action.payload);
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = modulesSlice.actions;
export default modulesSlice.reducer;