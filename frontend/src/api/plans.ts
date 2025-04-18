import axios, { AxiosResponse } from 'axios';
import  API_BASE_URL  from '../config';

// Interface for Plan (matches Plan model in backend)
interface Plan {
  plan_id: number;
  user_id: number;
  name: string;
  description: string | null;
  days_per_week: number;
  preferred_days: string | null;
  is_active: boolean;
}

// Interface for PlanDay (matches PlanDay model in backend)
interface PlanDay {
  plan_day_id: number;
  plan_id: number;
  day_number: number;
  description: string | null;
}

// Interface for PlanExercise (matches PlanExercise model in backend)
interface PlanExercise {
  plan_exercise_id: number;
  plan_day_id: number;
  exercise_id: number;
  exercise_name: string;
  category: string;
  primary_muscle: string;
  recommended_sets: string | null;
  recommended_reps: string | null;
  recommended_duration: string | null;
}

// Interface for generating a plan (request for POST /plans/generate)
interface GeneratePlanRequest {
  days_per_week: number;
  preferences?: { [key: string]: string[] };
  plan_name?: string;
  description?: string;
}

// Interface for the generated plan response (matches GeneratedPlan in backend)
interface GeneratedPlan {
  plan_id: number;
  name: string;
  description: string | null;
  days_per_week: number;
  preferred_days: string | null;
  is_active: boolean;
  days: GeneratedPlanDay[];
}

// Sub-interface for GeneratedPlanDay
interface GeneratedPlanDay {
  day_number: number;
  description: string;
  exercises: {
    exercise_id: number;
    exercise_name: string;
    primary_muscle: string;
    secondary_muscle: string | null;
    recommended_sets: number;
    recommended_reps: number;
    recommended_duration: string | null;
  }[];
}

// Interface for creating a plan (request for POST /plans)
interface PlanCreateRequest {
  name: string;
  description?: string;
  days_per_week: number;
  preferred_days?: string;
}

// Interface for updating a plan (request for PUT /plans/{plan_id})
interface PlanUpdateRequest {
  name: string;
  description?: string;
  days_per_week: number;
  preferred_days?: string;
}

// Interface for creating a plan day (request for POST /plans/{plan_id}/days)
interface PlanDayCreateRequest {
  day_number: number;
  description?: string;
}

// Interface for updating a plan day (request for PUT /plans/{plan_id}/days/{day_id})
interface PlanDayUpdateRequest {
  day_number: number;
  description?: string;
}

// Interface for adding an exercise to a day (request for POST /plans/{plan_id}/days/{day_id}/exercises)
interface PlanExerciseCreateRequest {
  exercise_id: number;
}

// Axios instance with base URL and default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Fetch all user plans (GET /plans)
export const getPlans = async (token: string): Promise<Plan[]> => {
  try {
    const response: AxiosResponse<Plan[]> = await apiClient.get('/plans', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    throw new Error('Failed to fetch user plans.');
  }
};

// Fetch details of a specific plan (GET /plans/{plan_id})
export const getPlan = async (token: string, planId: number): Promise<Plan> => {
  try {
    const response: AxiosResponse<Plan> = await apiClient.get(`/plans/${planId}`, {
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
      throw new Error('Plan not found.');
    }
    throw new Error('Failed to fetch plan details.');
  }
};

// Create a new plan (POST /plans)
export const createPlan = async (token: string, planData: PlanCreateRequest): Promise<Plan> => {
  try {
    const response: AxiosResponse<Plan> = await apiClient.post('/plans', planData, {
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
      throw new Error('Invalid request: Please check your input data.');
    }
    throw new Error('Failed to create plan.');
  }
};

// Update a plan (PUT /plans/{plan_id})
export const updatePlan = async (token: string, planId: number, planData: PlanUpdateRequest): Promise<Plan> => {
  try {
    const response: AxiosResponse<Plan> = await apiClient.put(`/plans/${planId}`, planData, {
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
      throw new Error('Plan not found.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid request: Please check your input data.');
    }
    throw new Error('Failed to update plan.');
  }
};

// Delete a plan (DELETE /plans/{plan_id})
export const deletePlan = async (token: string, planId: number): Promise<void> => {
  try {
    await apiClient.delete(`/plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 404) {
      throw new Error('Plan not found.');
    }
    throw new Error('Failed to delete plan.');
  }
};


// Generate a workout plan using the algo (POST /plans/generate)
export const generatePlan = async (token: string, requestData: GeneratePlanRequest): Promise<GeneratedPlan> => {
    try {
      const response: AxiosResponse<GeneratedPlan> = await apiClient.post('/plans/generate', requestData, {
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
        throw new Error('Invalid request: Please check your input data.');
      }
      throw new Error('Failed to generate workout plan.');
    }
  };


// Set a plan as active (PUT /plans/{plan_id}/set-active)
export const setPlanActive = async (token: string, planId: number): Promise<void> => {
  try {
    await apiClient.put(`/plans/${planId}/set-active`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 404) {
      throw new Error('Plan not found.');
    }
    throw new Error('Failed to set plan as active.');
  }
};

// Fetch all days for a plan (GET /plans/{plan_id}/days)
export const getPlanDays = async (token: string, planId: number): Promise<PlanDay[]> => {
  try {
    const response: AxiosResponse<PlanDay[]> = await apiClient.get(`/plans/${planId}/days`, {
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
      throw new Error('Plan or days not found.');
    }
    throw new Error('Failed to fetch plan days.');
  }
};

// Create a new day in a plan (POST /plans/{plan_id}/days)
export const createPlanDay = async (token: string, planId: number, dayData: PlanDayCreateRequest): Promise<PlanDay> => {
  try {
    const response: AxiosResponse<PlanDay> = await apiClient.post(`/plans/${planId}/days`, dayData, {
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
      throw new Error('Invalid request: Please check your input data.');
    }
    if (error.response?.status === 404) {
      throw new Error('Plan not found.');
    }
    throw new Error('Failed to create plan day.');
  }
};

// Update a plan day (PUT /plans/{plan_id}/days/{day_id})
export const updatePlanDay = async (token: string, planId: number, dayId: number, dayData: PlanDayUpdateRequest): Promise<PlanDay> => {
  try {
    const response: AxiosResponse<PlanDay> = await apiClient.put(`/plans/${planId}/days/${dayId}`, dayData, {
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
      throw new Error('Plan or day not found.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid request: Please check your input data.');
    }
    throw new Error('Failed to update plan day.');
  }
};

// Delete a plan day (DELETE /plans/{plan_id}/days/{day_id})
export const deletePlanDay = async (token: string, planId: number, dayId: number): Promise<void> => {
  try {
    await apiClient.delete(`/plans/${planId}/days/${dayId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 404) {
      throw new Error('Plan or day not found.');
    }
    throw new Error('Failed to delete plan day.');
  }
};

// Fetch exercises for a plan day (GET /plans/{plan_id}/days/{day_id}/exercises)
export const getPlanExercises = async (token: string, planId: number, dayId: number): Promise<PlanExercise[]> => {
  try {
    const response: AxiosResponse<PlanExercise[]> = await apiClient.get(`/plans/${planId}/days/${dayId}/exercises`, {
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
      throw new Error('Plan, day, or exercises not found.');
    }
    throw new Error('Failed to fetch plan exercises.');
  }
};

// Add an exercise to a plan day (POST /plans/{plan_id}/days/{day_id}/exercises)
export const addExerciseToDay = async (token: string, planId: number, dayId: number, exerciseData: PlanExerciseCreateRequest): Promise<PlanExercise> => {
  try {
    const response: AxiosResponse<PlanExercise> = await apiClient.post(`/plans/${planId}/days/${dayId}/exercises`, exerciseData, {
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
      throw new Error('Plan, day, or exercise not found.');
    }
    throw new Error('Failed to add exercise to plan day.');
  }
};

// Remove an exercise from a plan day (DELETE /plans/{plan_id}/days/{day_id}/exercises/{exercise_id})
export const removeExerciseFromDay = async (token: string, planId: number, dayId: number, exerciseId: number): Promise<void> => {
  try {
    await apiClient.delete(`/plans/${planId}/days/${dayId}/exercises/${exerciseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 404) {
      throw new Error('Plan, day, or exercise not found.');
    }
    throw new Error('Failed to remove exercise from plan day.');
  }
};