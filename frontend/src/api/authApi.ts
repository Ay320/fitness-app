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
    const response: AxiosResponse<SyncUserResponse> = await apiClient.post(
      '/auth/sync-user',
      {},  // No body needed for this endpoint
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    throw new Error('Failed to sync user with backend.');
  }
};