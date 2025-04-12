// src/types/index.ts

// Auth types
export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password?: string; // Optional for security - we don't want to store this in state
    created_at?: Date;
    updated_at?: Date;
    token?: string; // For authentication
  }
  
  export interface UserResponse {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at?: Date;
  }
  
  export interface UserCreate {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }
  
  export interface UserLogin {
    username: string;
    password: string;
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    message: string;
    permissions: Permission[];
  }
  
  // IAM types
  export interface Permission {
    id: number;
    action: 'create' | 'read' | 'update' | 'delete';
    module_id: number;
    created_at?: Date;
    updated_at?: Date;
    module?: Module; // For joining with module data
  }
  
  export interface PermissionCreate {
    action: 'create' | 'read' | 'update' | 'delete';
    module_id: number;
  }
  
  export interface Role {
    id: number;
    name: string;
    created_at?: Date;
    updated_at?: Date;
    permissions?: Permission[]; // For joined data
  }
  
  export interface RoleCreate {
    name: string;
  }
  
  export interface Group {
    id: number;
    name: string;
    created_at?: Date;
    updated_at?: Date;
    users?: User[]; // For joined data
    roles?: Role[]; // For joined data
  }
  
  export interface GroupCreate {
    name: string;
  }
  
  export interface Module {
    id: number;
    name: string;
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface ModuleCreate {
    name: string;
  }
  
  export interface SimulationRequest {
    module_id: number;
    action: 'create' | 'read' | 'update' | 'delete';
  }
  
  export interface SimulationResult {
    success: boolean;
    message: string;
  }