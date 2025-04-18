/**
 * Handles API calls to backend user-related endpoints using Axios.
 */

import axios, { AxiosResponse } from 'axios';
import API_BASE_URL from '../config';

// Define the shape of the request for /user/profile
interface UserProfileUpdateRequest {
  username: string;
  date_of_birth: string; // ISO format, e.g., "1990-01-01"
  gender: string;
  weight_kg: number;
  height_cm: number;
  fitness_goal: string;
  experience_level: string;
}

// Define the shape of the response from /user/profile
interface ProfileUpdateResponse {
  message: string;
  user_id: number;
}

// Define the shape of the response from /user/streak
interface StreakResponse {
  current_streak: number;
}

// Create an Axios instance with the base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to update the user's profile
export const updateUserProfile = async (token: string, profileData: UserProfileUpdateRequest): Promise<ProfileUpdateResponse> => {
  try {
    const response: AxiosResponse<ProfileUpdateResponse> = await apiClient.post('/user/profile', profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    throw new Error('Failed to update user profile.');
  }
};

// Function to fetch the user's current streak
export const getUserStreak = async (token: string): Promise<StreakResponse> => {
  try {
    const response: AxiosResponse<StreakResponse> = await apiClient.get('/user/streak', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 404) {
      throw new Error('User not found.');
    }
    throw new Error('Failed to fetch user streak.');
  }
};