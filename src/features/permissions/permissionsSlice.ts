// src/features/permissions/permissionsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Permission, Module } from '../../types';
import instance from '../../api/axios';

interface PermissionsState {
  permissions: Permission[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

const initialState: PermissionsState = {
  permissions: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all permissions
export const getPermissions = createAsyncThunk<
  { permissions: Permission[] }, 
  void, 
  { rejectValue: string }
>('permissions/getAll', async (_, thunkAPI) => {
  try {
    const response = await instance.get('api/permissions');
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

// Create new permission
export const createPermission = createAsyncThunk<
  Permission, 
  { action: 'create' | 'read' | 'update' | 'delete'; module_id: number }, 
  { rejectValue: string }
>('permissions/create', async (permissionData, thunkAPI) => {
  try {
    const response = await instance.post('api/permissions', permissionData);
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

// Update permission
export const updatePermission = createAsyncThunk<
  Permission, 
  Permission, 
  { rejectValue: string }
>('permissions/update', async (permissionData, thunkAPI) => {
  try {
    const response = await instance.put(`api/permissions/${permissionData.id}`, permissionData);
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

// Delete permission
export const deletePermission = createAsyncThunk<
  number, 
  number, 
  { rejectValue: string }
>('permissions/delete', async (permissionId, thunkAPI) => {
  try {
    await instance.delete(`api/permissions/${permissionId}`);
    return permissionId;
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

export const permissionsSlice = createSlice({
  name: 'permissions',
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
      .addCase(getPermissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPermissions.fulfilled, (state, action: PayloadAction<{ permissions: Permission[] }>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.permissions = action.payload.permissions;
      })
      .addCase(getPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(createPermission.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPermission.fulfilled, (state, action: PayloadAction<Permission>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.permissions.push(action.payload);
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(updatePermission.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePermission.fulfilled, (state, action: PayloadAction<Permission>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.permissions = state.permissions.map((permission) => 
          permission.id === action.payload.id ? action.payload : permission
        );
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deletePermission.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePermission.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.permissions = state.permissions.filter((permission) => permission.id !== action.payload);
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = permissionsSlice.actions;
export default permissionsSlice.reducer;