// src/api/axios.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { User } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL 

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add JWT to all requests
instance.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const userStr = localStorage.getItem('user');
    const user: User | null = userStr ? JSON.parse(userStr) : null;
    
    if (user && user.token && config.headers) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;