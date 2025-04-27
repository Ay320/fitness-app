import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getActivePlan, getPlanDays, getPlanExercises, generatePlan } from '../../src/api/plans'; 
import { AuthContext } from '../../src/AuthContext';

const PlanScreen = () => {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  const [activePlan, setActivePlan] = useState(null);
  const [planDays, setPlanDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleGeneratePlan = async () => {
    try {
      
      const requestData = {
        days_per_week: 5, 
        preferences: { muscle_groups: ['chest', 'legs'] }, 
        plan_name: 'My Generated Plan',
        description: 'A custom generated workout plan',
      };

      const generatedPlan = await generatePlan(token, requestData);

      
      navigation.navigate('ViewPlanScreen', { plan: generatedPlan.plan_id });
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate plan. Please try again.');
    }
  };

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const activePlanData = await getActivePlan(token);
        setActivePlan(activePlanData);

        if (activePlanData) {
          const days = await getPlanDays(token, activePlanData.plan_id);

          const daysWithExercises = await Promise.all(
            days.map(async (day) => {
              const exercises = await getPlanExercises(token, activePlanData.plan_id, day.plan_day_id);
              return { ...day, exercises };
            })
          );

          setPlanDays(daysWithExercises);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching plan data:', error);
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [token]);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="white"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );
  }

  if (!activePlan) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPlanText}>No active plan found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{activePlan.name}</Text>
          <Text style={styles.planDescription}>{activePlan.description}</Text>
        </View>

        {planDays.map((day) => (
          <View key={day.plan_day_id} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>Day {day.day_number}</Text>

            {day.exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.plan_exercise_id}
                style={styles.exerciseCard}
                onPress={() => navigation.navigate('WorkoutDetailsScreen', { exercise })}
              >
                <View style={styles.exerciseContent}>
                  {exercise.image_url && (
                    <Image
                      source={{ uri: exercise.image_url }}
                      style={styles.exerciseImage}
                    />
                  )}
                  <View style={styles.exerciseText}>
                    <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.recommended_sets} sets x {exercise.recommended_reps} reps
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('ShowPlansScreen')}>
          <Text style={styles.bottomButtonText}>View Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('EditPlanScreen')}>
          <Text style={styles.bottomButtonText}>Create Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={handleGeneratePlan}>
          <Text style={styles.bottomButtonText}>Generate Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  noPlanText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  planHeader: {
    marginBottom: 20,
  },
  planTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  planDescription: {
    color: 'gray',
    fontSize: 16,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  exerciseText: {
    flex: 1,
  },
  exerciseName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseDetails: {
    color: 'gray',
    fontSize: 14,
    marginTop: 5,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'black',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  bottomButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PlanScreen;
