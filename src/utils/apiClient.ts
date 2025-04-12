import axios, { AxiosInstance } from 'axios';
export const BASE_URL = "http://localhost:5000"

// Create axios instance with base URL
export const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});
