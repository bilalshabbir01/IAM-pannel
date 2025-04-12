// src/features/groups/groupsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Group, User, Role } from '../../types';
import instance from '../../api/axios';

interface GroupsState {
  groups: Group[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

const initialState: GroupsState = {
  groups: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all groups
export const getGroups = createAsyncThunk<
  Group[],
  void,
  { rejectValue: string }
>('groups/getAll', async (_, thunkAPI) => {
  try {
    const response = await instance.get('api/groups');
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

// Create new group
export const createGroup = createAsyncThunk<
  Group,
  { name: string },
  { rejectValue: string }
>('groups/create', async (groupData, thunkAPI) => {
  try {
    const response = await instance.post('api/groups', groupData);
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

// Update group
export const updateGroup = createAsyncThunk<
  Group,
  Group,
  { rejectValue: string }
>('groups/update', async (groupData, thunkAPI) => {
  try {
    const response = await instance.put(`api/groups/${groupData.id}`, groupData);
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

// Delete group
export const deleteGroup = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('groups/delete', async (groupId, thunkAPI) => {
  try {
    await instance.delete(`api/groups/${groupId}`);
    return groupId;
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

// Assign users to group
export const assignUserToGroup = createAsyncThunk<
  { groupId: number, userIds: number[] },
  { groupId: number, userIds: number[] },
  { rejectValue: string }
>('groups/assignUser', async ({ groupId, userIds }, thunkAPI) => {
  try {
    await instance.post(`api/groups/${groupId}/users`, { userIds });
    return { groupId, userIds };
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


// Remove user from group
export const removeUserFromGroup = createAsyncThunk<
  { groupId: number, userId: number },
  { groupId: number, userId: number },
  { rejectValue: string }
>('groups/removeUser', async ({ groupId, userId }, thunkAPI) => {
  try {
    await instance.delete(`api/groups/${groupId}/users/${userId}`);
    return { groupId, userId };
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

// Assign role to group
export const assignRoleToGroup = createAsyncThunk<
  { groupId: number, roleId: number },
  { groupId: number, roleId: number },
  { rejectValue: string }
>('groups/assignRole', async ({ groupId, roleId }, thunkAPI) => {
  try {
    await instance.post(`api/groups/${groupId}/roles`, { roleId });
    return { groupId, roleId };
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

// Remove role from group
export const removeRoleFromGroup = createAsyncThunk<
  { groupId: number, roleId: number },
  { groupId: number, roleId: number },
  { rejectValue: string }
>('groups/removeRole', async ({ groupId, roleId }, thunkAPI) => {
  try {
    await instance.delete(`api/groups/${groupId}/roles/${roleId}`);
    return { groupId, roleId };
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

export const groupsSlice = createSlice({
  name: 'groups',
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
      .addCase(getGroups.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getGroups.fulfilled, (state, action: PayloadAction<Group[]>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.groups = action.payload?.groups;
      })
      .addCase(getGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createGroup.fulfilled, (state, action: PayloadAction<Group>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(updateGroup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateGroup.fulfilled, (state, action: PayloadAction<Group>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.groups = state.groups.map((group) =>
          group.id === action.payload.id ? action.payload : group
        );
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deleteGroup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteGroup.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.groups = state.groups.filter((group) => group.id !== action.payload);
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(assignUserToGroup.fulfilled, (state, action) => {
        const { groupId, userId } = action.payload;
        const groupIndex = state.groups.findIndex(group => group.id === groupId);

        if (groupIndex !== -1) {
          if (!state.groups[groupIndex].users) {
            state.groups[groupIndex].users = [];
          }

          // Add user ID if not already in the group
          if (!state.groups[groupIndex].users?.some(user => user.id === userId)) {
            state.groups[groupIndex].users?.push({ id: userId } as User);
          }
        }
      })
      .addCase(removeUserFromGroup.fulfilled, (state, action) => {
        const { groupId, userId } = action.payload;
        const groupIndex = state.groups.findIndex(group => group.id === groupId);

        if (groupIndex !== -1 && state.groups[groupIndex].users) {
          state.groups[groupIndex].users = state.groups[groupIndex].users?.filter(
            user => user.id !== userId
          );
        }
      })
      .addCase(assignRoleToGroup.fulfilled, (state, action) => {
        const { groupId, roleId } = action.payload;
        const groupIndex = state.groups.findIndex(group => group.id === groupId);

        if (groupIndex !== -1) {
          if (!state.groups[groupIndex].roles) {
            state.groups[groupIndex].roles = [];
          }

          // Add role ID if not already in the group
          if (!state.groups[groupIndex].roles?.some(role => role.id === roleId)) {
            state.groups[groupIndex].roles?.push({ id: roleId } as Role);
          }
        }
      })
      .addCase(removeRoleFromGroup.fulfilled, (state, action) => {
        const { groupId, roleId } = action.payload;
        const groupIndex = state.groups.findIndex(group => group.id === groupId);

        if (groupIndex !== -1 && state.groups[groupIndex].roles) {
          state.groups[groupIndex].roles = state.groups[groupIndex].roles?.filter(
            role => role.id !== roleId
          );
        }
      });
  },
});

export const { reset } = groupsSlice.actions;
export default groupsSlice.reducer;