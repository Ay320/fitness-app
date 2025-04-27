import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getPlan, getPlanDays, getPlanExercises } from '../../src/api/plans';
import { AuthContext } from '../../src/AuthContext';

const ViewPlanScreen = () => {
  const [planDetails, setPlanDetails] = useState(null);
  const [planDays, setPlanDays] = useState([]);
  const [exercisesByDay, setExercisesByDay] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { plan } = route.params; 

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const fetchedPlanDetails = await getPlan(token, plan);
        setPlanDetails(fetchedPlanDetails);

        const fetchedPlanDays = await getPlanDays(token, plan);
        setPlanDays(fetchedPlanDays);

        const exercises = {};
        for (const day of fetchedPlanDays) {
          const dayExercises = await getPlanExercises(token, plan, day.plan_day_id);
          exercises[day.plan_day_id] = dayExercises;
        }
        setExercisesByDay(exercises);
      } catch (error) {
        console.error('Failed to fetch plan data:', error);
        setError('Failed to fetch plan data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [plan, token]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!planDetails) {
    return (
      <View style={styles.centered}>
        <Text>No details available for this plan.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.planTitle}>{planDetails.name}</Text>
      <Text style={styles.planDescription}>
        {planDetails.description || 'No description available'}
      </Text>

      <Text style={styles.sectionTitle}>Plan Days:</Text>
      {planDays.length > 0 ? (
        planDays.map((day) => (
          <View key={day.plan_day_id} style={styles.dayCard}>
            <Text style={styles.dayTitle}>Day {day.day_number}</Text>
            <Text style={styles.dayDescription}>
              {day.description || 'No description available'}
            </Text>
            {exercisesByDay[day.plan_day_id] && exercisesByDay[day.plan_day_id].length > 0 ? (
              exercisesByDay[day.plan_day_id].map((exercise, index) => (
                <View key={index} style={styles.exerciseCard}>
                  <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                  <Text style={styles.exerciseInfo}>
                    Sets: {exercise.recommended_sets || 'N/A'} | Reps: {exercise.recommended_reps || 'N/A'}
                  </Text>
                  <Text style={styles.exerciseDescription}>
                    {exercise.category} - {exercise.primary_muscle}
                  </Text>
                </View>
              ))
            ) : (
              <Text>No exercises available for this day.</Text>
            )}
          </View>
        ))
      ) : (
        <Text>No days available for this plan.</Text>
      )}

      <Button title="Back" onPress={handleBackPress} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  dayCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dayDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  exerciseCard: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#555',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default ViewPlanScreen;