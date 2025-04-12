// src/features/roles/rolesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Role, Permission } from '../../types';
import instance from '../../api/axios';

interface RolesState {
  roles: Role[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

const initialState: RolesState = {
  roles: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all roles
export const getRoles = createAsyncThunk<
  { roles: Role[] }, 
  void, 
  { rejectValue: string }
>('roles/getAll', async (_, thunkAPI) => {
  try {
    const response = await instance.get('/api/roles');
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

// Create new role
export const createRole = createAsyncThunk<
  Role, 
  { name: string }, 
  { rejectValue: string }
>('roles/create', async (roleData, thunkAPI) => {
  try {
    const response = await instance.post('/api/roles', roleData);
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

// Update role
export const updateRole = createAsyncThunk<
  Role, 
  Role, 
  { rejectValue: string }
>('roles/update', async (roleData, thunkAPI) => {
  try {
    const response = await instance.put(`/api/roles/${roleData.id}`, roleData);
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

// Delete role
export const deleteRole = createAsyncThunk<
  number, 
  number, 
  { rejectValue: string }
>('roles/delete', async (roleId, thunkAPI) => {
  try {
    await instance.delete(`/api/roles/${roleId}`);
    return roleId;
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

// Assign permission to role
export const assignPermissionToRole = createAsyncThunk<
  { roleId: number, permissionId: number }, 
  { roleId: number, permissionId: number }, 
  { rejectValue: string }
>('roles/assignPermission', async ({ roleId, permissionId }, thunkAPI) => {
  try {
    await instance.post(`/api/roles/${roleId}/permissions`, { permissionId });
    return { roleId, permissionId };
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

// Remove permission from role
export const removePermissionFromRole = createAsyncThunk<
  { roleId: number, permissionId: number }, 
  { roleId: number, permissionId: number }, 
  { rejectValue: string }
>('roles/removePermission', async ({ roleId, permissionId }, thunkAPI) => {
  try {
    await instance.delete(`/api/roles/${roleId}/permissions/${permissionId}`);
    return { roleId, permissionId };
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

export const rolesSlice = createSlice({
  name: 'roles',
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
      .addCase(getRoles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRoles.fulfilled, (state, action: PayloadAction<{ roles: Role[] }>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.roles = action.payload.roles;
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.roles = state.roles.map((role) => 
          role.id === action.payload.id ? action.payload : role
        );
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deleteRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.roles = state.roles.filter((role) => role.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(assignPermissionToRole.fulfilled, (state, action) => {
        const { roleId, permissionId } = action.payload;
        const roleIndex = state.roles.findIndex(role => role.id === roleId);
        
        if (roleIndex !== -1) {
          if (!state.roles[roleIndex].permissions) {
            state.roles[roleIndex].permissions = [];
          }
          
          // Add permission ID if not already in the role
          if (!state.roles[roleIndex].permissions?.some(perm => perm.id === permissionId)) {
            state.roles[roleIndex].permissions?.push({ id: permissionId } as Permission);
          }
        }
      })
      .addCase(removePermissionFromRole.fulfilled, (state, action) => {
        const { roleId, permissionId } = action.payload;
        const roleIndex = state.roles.findIndex(role => role.id === roleId);
        
        if (roleIndex !== -1 && state.roles[roleIndex].permissions) {
          state.roles[roleIndex].permissions = state.roles[roleIndex].permissions?.filter(
            perm => perm.id !== permissionId
          );
        }
      });
  },
});

export const { reset } = rolesSlice.actions;
export default rolesSlice.reducer;