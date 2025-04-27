import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { getPlan, getPlanDays, getPlanExercises, deletePlan,setPlanActive } from '../../src/api/plans';
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

        const exercisesArray = await Promise.all(
          fetchedPlanDays.map((day) => getPlanExercises(token, plan, day.plan_day_id))
        );

        const exercises = {};
        fetchedPlanDays.forEach((day, index) => {
          exercises[day.plan_day_id] = exercisesArray[index];
        });

        setPlanDays(fetchedPlanDays);
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

  const handleEditPress = () => {
    navigation.navigate('EditPlanScreen', { plan });
  };

  const handleDeletePress = async () => {
    try {
      setLoading(true);
      await deletePlan(token, plan);
      navigation.navigate('ShowPlansScreen');
    } catch (error) {
      console.error('Failed to delete plan:', error);
      setError('Failed to delete the plan. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSetActivePress = async () => {
    try {
      setPlanActive(token, plan);
      Alert.alert('Plan Set Active', `You have set "${planDetails.name}" as your active plan.`);
    } catch (error) {
      console.error('Failed to set active plan:', error);
      setError('Failed to set plan active. Please try again later.');
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="white"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!planDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No details available for this plan.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Feather name="chevron-left" size={30} color="white" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.planTitle}>{planDetails.name}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
              <Feather name="edit-2" size={22} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton}>
              <Feather name="trash-2" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.planDescription}>
          {planDetails.description || 'No description available'}
        </Text>

        {planDays.map((day) => (
          <View key={day.plan_day_id} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>Day {day.day_number}</Text>

            {(exercisesByDay[day.plan_day_id] || []).map((exercise) => (
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

      {/* Set Active Button at the bottom */}
      <TouchableOpacity style={styles.setActiveButton} onPress={handleSetActivePress}>
        <Text style={styles.setActiveButtonText}>Set Active Plan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 140, // increased so content isn't hidden behind button
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  planTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
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
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  setActiveButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'limegreen',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setActiveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ViewPlanScreen;
