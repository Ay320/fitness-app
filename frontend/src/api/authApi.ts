/**
 * Handles API calls to backend authentication endpoints.
 * get firbase token first from firebaseAuth (signIn), then sync user
 */

import axios, { AxiosResponse } from 'axios';
import API_BASE_URL from '../config';

// Define the shape of the response from /auth/sync-user
interface SyncUserResponse {
  message: string;
  uid: string;
  user_id: number;
}

// Create an Axios instance with the base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to sync user with backend using the Firebase token
export const syncUser = async (token: string): Promise<SyncUserResponse> => {
  try {
    console.log('Starting syncUser request...');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Full URL:', `${API_BASE_URL}/auth/sync-user`);
    console.log('Token:', token);
    console.log('Axios config:', apiClient.defaults);

    const response = await apiClient.post<SyncUserResponse>(
      '/auth/sync-user',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    return response.data;
  } catch (err: any) {
    console.error('❌ syncUser error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      code: err.code,           // e.g., ECONNABORTED for timeouts
      config: err.config,       // Request config
      request: err.request,     // Request details
    });
    if (err.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    throw new Error(`Sync failed: ${err.response?.data?.detail || err.message}`);
  }
};