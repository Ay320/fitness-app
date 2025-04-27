import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
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

  // States for user inputs
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [excludedExercises, setExcludedExercises] = useState('');
  const [excludedEquipment, setExcludedEquipment] = useState('');
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  const handleGeneratePlan = async () => {
    if (!daysPerWeek || isNaN(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
      Alert.alert('Validation Error', 'Please enter a valid number of days per week (1-7).');
      return;
    }

    // Parse excluded exercises and equipment into arrays
    const excludedExercisesArray = excludedExercises.split(',').map(item => item.trim()).filter(item => item);
    const excludedEquipmentArray = excludedEquipment.split(',').map(item => item.trim()).filter(item => item);

    const requestData = {
      days_per_week: parseInt(daysPerWeek, 10),
      preferences: {
        exercises: excludedExercisesArray,
        equipment: excludedEquipmentArray,
      },
      plan_name: planName || 'My AI Generated Plan',
      description: description || 'A custom AI generated workout plan',
    };

    try {
      const generatedPlan = await generatePlan(token, requestData);
      navigation.navigate('ViewPlanScreen', { plan: generatedPlan.plan_id });
      setShowGenerateForm(false); // Hide form after successful generation
      setDaysPerWeek('');
      setExcludedExercises('');
      setExcludedEquipment('');
      setPlanName('');
      setDescription('');
    } catch (error) {
      console.error('Error generating plan:', error);
      Alert.alert('Error', 'Failed to generate plan. Please try again.');
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
      onPress={() => navigation.navigate('WorkoutDetailsScreen', { exercise: item })}
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

      {/* Generate Plan Form */}
      {showGenerateForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Generate a New Plan</Text>

          <TextInput
            style={styles.input}
            placeholder="Number of days per week (1-7)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={daysPerWeek}
            onChangeText={setDaysPerWeek}
          />

          <TextInput
            style={styles.input}
            placeholder="Exclude exercises (e.g., Push-ups, Squats)"
            placeholderTextColor="#888"
            value={excludedExercises}
            onChangeText={setExcludedExercises}
          />

          <TextInput
            style={styles.input}
            placeholder="Exclude equipment (e.g., Dumbbells, Barbell)"
            placeholderTextColor="#888"
            value={excludedEquipment}
            onChangeText={setExcludedEquipment}
          />

          <TextInput
            style={styles.input}
            placeholder="Plan Name (optional)"
            placeholderTextColor="#888"
            value={planName}
            onChangeText={setPlanName}
          />

          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePlan}>
            <Text style={styles.generateButtonText}>Generate Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowGenerateForm(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('ShowPlansScreen')}>
          <Text style={styles.bottomButtonText}>View Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('EditPlanScreen')}>
          <Text style={styles.bottomButtonText}>Create a Plan manually</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => setShowGenerateForm(true)}
        >
          <Text style={styles.bottomButtonText}>Generate a Plan using AI</Text>
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
  formContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#555',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default PlanScreen;