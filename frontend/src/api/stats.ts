import axios, { AxiosResponse } from 'axios';
import  API_BASE_URL  from '../config';

// Interface for Workout Distribution by Type
interface WorkoutDistribution {
  type: string;
  count: number;
}

// Interface for Workout Distribution by Muscle Group
interface MuscleGroupDistribution {
  muscle_group: string;
  count: number;
}

// Interface for Weight Entry
interface WeightEntry {
  date: string; // ISO format, e.g., "2023-10-25"
  weight: number;
}

// Interface for creating a weight entry
interface WeightCreate {
  weight_kg: number;
  date_logged?: string; // Optional, ISO format
}

// Interface for Daily Workout Frequency
interface FrequencyEntry {
  date: string; // ISO format, e.g., "2023-10-25"
  count: number;
}

// Interface for Weekly Workout Frequency
interface WeeklyFrequencyEntry {
  year: number;
  week: number;
  count: number;
}

// Axios instance with base URL and default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch workout distribution by type (GET /stats/workouts/by-type)
export const getWorkoutsByType = async (token: string, startDate: string, endDate: string): Promise<WorkoutDistribution[]> => {
  try {
    const response: AxiosResponse<WorkoutDistribution[]> = await apiClient.get('/stats/workouts/by-type', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid request: Please check the date format (YYYY-MM-DD).');
    }
    throw new Error('Failed to fetch workout distribution by type.');
  }
};

// Fetch workout distribution by muscle group (GET /stats/workouts/by-muscle-group)
export const getWorkoutsByMuscleGroup = async (token: string, startDate: string, endDate: string): Promise<MuscleGroupDistribution[]> => {
  try {
    const response: AxiosResponse<MuscleGroupDistribution[]> = await apiClient.get('/stats/workouts/by-muscle-group', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid request: Please check the date format (YYYY-MM-DD).');
    }
    throw new Error('Failed to fetch workout distribution by muscle group.');
  }
};

// Fetch user weight history (GET /stats/weight/history)
export const getWeightHistory = async (token: string, startDate: string, endDate: string): Promise<WeightEntry[]> => {
  try {
    const response: AxiosResponse<WeightEntry[]> = await apiClient.get('/stats/weight/history', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid request: Please check the date format (YYYY-MM-DD).');
    }
    throw new Error('Failed to fetch weight history.');
  }
};

// Log a new weight entry (POST /stats/weight)
export const logWeight = async (token: string, weightData: WeightCreate): Promise<WeightEntry> => {
  try {
    const response: AxiosResponse<WeightEntry> = await apiClient.post('/stats/weight', weightData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid request: Please check the weight data.');
    }
    throw new Error('Failed to log weight entry.');
  }
};

// Fetch daily workout frequency (GET /stats/workouts/frequency?granularity=daily)
export const getDailyWorkoutFrequency = async (token: string, startDate: string, endDate: string): Promise<FrequencyEntry[]> => {
  try {
    const response: AxiosResponse<FrequencyEntry[]> = await apiClient.get('/stats/workouts/frequency', {
      params: {
        start_date: startDate,
        end_date: endDate,
        granularity: 'daily',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid request: Please check the date format (YYYY-MM-DD).');
    }
    throw new Error('Failed to fetch daily workout frequency.');
  }
};

// Fetch weekly workout frequency (GET /stats/workouts/frequency?granularity=weekly)
export const getWeeklyWorkoutFrequency = async (token: string, startDate: string, endDate: string): Promise<WeeklyFrequencyEntry[]> => {
  try {
    const response: AxiosResponse<WeeklyFrequencyEntry[]> = await apiClient.get('/stats/workouts/frequency', {
      params: {
        start_date: startDate,
        end_date: endDate,
        granularity: 'weekly',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid request: Please check the date format (YYYY-MM-DD).');
    }
    throw new Error('Failed to fetch weekly workout frequency.');
  }
};