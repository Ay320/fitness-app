import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { getActivePlan, getPlanDays, getPlanExercises, generatePlan } from '../../src/api/plans';
import { AuthContext } from '../../src/AuthContext';

const PlanScreen = () => {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  const [activePlan, setActivePlan] = useState(null);
  const [planDays, setPlanDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError('Failed to fetch plan data. Please try again.');
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [token]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('WorkoutDetailsScreen', { exercise })}
    >
      <View style={styles.exerciseContent}>
        {item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            style={styles.exerciseImage}
          />
        )}
        <View style={styles.exerciseText}>
          <Text style={styles.exerciseName}>{item.exercise_name}</Text>
          <Text style={styles.exerciseDetails}>
            {item.recommended_sets} sets x {item.recommended_reps} reps
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDayItem = ({ item }) => (
    <View style={styles.dayContainer}>
      <Text style={styles.dayTitle}>Day {item.day_number}</Text>
      <FlatList
        data={item.exercises}
        keyExtractor={(exercise) => exercise.plan_exercise_id.toString()}
        renderItem={renderExerciseItem}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Feather name="chevron-left" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activePlan ? activePlan.name : 'My Plan'}
        </Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !activePlan ? (
          <View style={styles.centered}>
            <Text style={styles.noPlanText}>No active plan found.</Text>
          </View>
        ) : (
          <FlatList
            data={planDays}
            keyExtractor={(item) => item.plan_day_id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={renderDayItem}
          />
        )}
      </View>

      {/* Bottom Buttons */}
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
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'black',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
    padding: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // padding for bottom buttons
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noPlanText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
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
