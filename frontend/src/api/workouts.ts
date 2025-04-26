import axios, { AxiosResponse } from 'axios';
import  API_BASE_URL  from '../config';

// Note: logging a workout here has two functions: one is for workouts that are not part of a plan,
// and the other is for workouts that are part of a plan.

// Interface for an exercise (response from GET /workouts/)
interface Exercise {
  id: number;
  exercise_name: string;
  primary_muscle: string;
  secondary_muscle: string | null;
  difficulty: string;
  category: string;
  equipment: string | null;
  initial_recommended_sets: string | null;
  initial_recommended_reps: string | null;
  initial_recommended_time: string | null;
  instructions: string | null;
  injury_prevention_tips: string | null;
  image_url: string | null;
}

// Interface for creating a workout log (request for POST /workouts/log)
interface WorkoutLogCreateRequest {
  sets: number;
  reps: number;
  duration_minutes?: number;
  weight?: number;
  notes?: string;
}

// Interface for the response from logging a workout (POST /workouts/log)
interface LogWorkoutResponse {
  message: string;
  log_id: number;
}

// Interface for a workout log (response from GET /workouts/logs)
interface WorkoutLog {
  log_id: number;
  user_id: number;
  exercise_id: number;
  exercise_name: string;
  date_logged: string; // ISO format
  sets: number;
  reps: number;
  duration_minutes: number | null;
  weight: number | null;
  notes: string | null;
}

// Interface for updating a workout log (request for PUT /workouts/logs/{log_id})
interface WorkoutLogUpdateRequest {
  sets?: number;
  reps?: number;
  duration_minutes?: number;
  weight?: number;
  notes?: string;
}

// Interface for the response from updating a workout log (PUT /workouts/logs/{log_id})
interface UpdateLogResponse {
  message: string;
}

// Interface for the response from deleting a workout log (DELETE /workouts/logs/{log_id})
interface DeleteLogResponse {
  message: string;
}

// Interface for logging a workout that is part of a plan
interface PlanWorkoutLogResponse {
  workout_log_id: number;
  plan_exercise_id: number;
  exercise_id: number;
  sets: number;
  reps: number;
  weight: number | null;
  notes: string | null;
  created_at: string; // ISO format string
}

// Create an Axios instance with the base URL and default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch all available exercises (GET /workouts/)
export const getExercises = async (token: string): Promise<Exercise[]> => {
  try {
    const response: AxiosResponse<Exercise[]> = await apiClient.get('/workouts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    throw new Error('Failed to fetch exercises.');
  }
};

// Log a workout for the user, not part of a plan (POST /workouts/log)
export const logWorkout = async (token: string, exerciseId: number, workoutData: WorkoutLogCreateRequest): Promise<LogWorkoutResponse> => {
  try {
    const response: AxiosResponse<LogWorkoutResponse> = await apiClient.post(
      `/workouts/log?exercise_id=${exerciseId}`,
      workoutData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error logging workout:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 404) {
      throw new Error('Exercise not found.');
    }
    throw new Error(error.response?.data?.message || 'Failed to log workout!!');
  }
};


// Log a workout for the user (part of a plan)
export const logPlanWorkout = async (
  token: string,
  planId: number,
  dayId: number,
  planExerciseId: number,
  workoutData: WorkoutLogCreateRequest
): Promise<PlanWorkoutLogResponse> => {
  try {
    const response = await apiClient.post<PlanWorkoutLogResponse>(
      `/plans/${planId}/days/${dayId}/exercises/${planExerciseId}/log`,
      workoutData,
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
    if (error.response?.status === 404) {
      throw new Error('Plan, day, or exercise not found.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid request: Please check your input data.');
    }
    throw new Error('Failed to log workout for plan.');
  }
};

// Retrieve the user's workout logs (GET /workouts/logs)
export const getWorkoutLogs = async (token: string): Promise<WorkoutLog[]> => {
  try {
    const response: AxiosResponse<WorkoutLog[]> = await apiClient.get('/workouts/logs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    throw new Error('Failed to fetch workout logs.');
  }
};

// Update an existing workout log (PUT /workouts/logs/{log_id})
export const updateWorkoutLog = async (token: string, logId: number, updateData: WorkoutLogUpdateRequest): Promise<UpdateLogResponse> => {
  try {
    const response: AxiosResponse<UpdateLogResponse> = await apiClient.put(`/workouts/logs/${logId}`, updateData, {
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
      throw new Error('Workout log not found or not owned by user.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid update data. Please check the provided fields.');
    }
    throw new Error('Failed to update workout log.');
  }
};

// Delete a workout log (DELETE /workouts/logs/{log_id})
export const deleteWorkoutLog = async (token: string, logId: number): Promise<DeleteLogResponse> => {
  try {
    const response: AxiosResponse<DeleteLogResponse> = await apiClient.delete(`/workouts/logs/${logId}`, {
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
      throw new Error('Workout log not found or not owned by user.');
    }
    throw new Error('Failed to delete workout log.');
  }
};