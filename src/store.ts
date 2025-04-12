// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import usersReducer from './features/users/usersSlice';
import groupsReducer from './features/groups/groupsSlice';
import rolesReducer from './features/roles/rolesSlice';
import modulesReducer from './features/modules/modulesSlice';
import permissionsReducer from './features/permissions/permissionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    groups: groupsReducer,
    roles: rolesReducer,
    modules: modulesReducer,
    permissions: permissionsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;