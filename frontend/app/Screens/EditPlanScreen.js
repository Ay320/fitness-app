import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createPlan, updatePlan, createPlanDay, addExerciseToDay, deletePlan, getPlanDays, getPlanExercises, updatePlanDay, deletePlanDay, removeExerciseFromDay } from '../../src/api/plans';
import { AuthContext } from '../../src/AuthContext';

const EditPlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useContext(AuthContext);
  const isEditing = !!route.params?.plan;
  const initialPlan = route.params?.plan || { name: '', description: '', days: [], plan_id: null };

  const [planName, setPlanName] = useState(initialPlan.name);
  const [description, setDescription] = useState(initialPlan.description);
  const [days, setDays] = useState([]);
  const [originalDays, setOriginalDays] = useState([]);

  // Fetch existing plan data when editing
  useEffect(() => {
    const fetchPlanData = async () => {
      if (isEditing && initialPlan.plan_id) {
        console.log('Fetching plan data for planId:', initialPlan.plan_id);
        try {
          const fetchedDays = await getPlanDays(token, initialPlan.plan_id);
          console.log('Fetched days:', fetchedDays.length, 'days');
          const daysWithExercises = await Promise.all(
            fetchedDays.map(async (day) => {
              const exercises = await getPlanExercises(token, initialPlan.plan_id, day.plan_day_id);
              console.log(`Fetched ${exercises.length} exercises for day ${day.plan_day_id}`);
              return {
                plan_day_id: day.plan_day_id,
                day_number: day.day_number,
                note: day.description || '',
                exercises: exercises.map(ex => ({
                  plan_exercise_id: ex.plan_exercise_id,
                  id: ex.exercise_id,
                  name: ex.exercise_name,
                  image: ex.image_url || 'https://via.placeholder.com/40',
                })),
              };
            })
          );
          setDays(daysWithExercises);
          setOriginalDays(daysWithExercises);
          console.log('Plan data loaded successfully');
        } catch (error) {
          console.error('Failed to fetch plan data:', error.message || error);
          Alert.alert('Error', 'Failed to load plan details.');
        }
      } else {
        console.log('Initializing new plan with days:', initialPlan.days.length);
        setDays(initialPlan.days.map(day => ({
          day_number: day.day_number || 1,
          note: day.note || '',
          exercises: day.exercises || [],
        })));
      }
    };
    fetchPlanData();
  }, [isEditing, initialPlan.plan_id, token]);

  const handleSave = async () => {
    if (!planName.trim()) {
      console.warn('Plan name is empty');
      Alert.alert('Validation Error', 'Plan name cannot be empty.');
      return;
    }

    const daysPerWeek = days.length;
    const planData = {
      name: planName,
      description: description || '',
      days_per_week: daysPerWeek,
      preferred_days: null,
    };

    let planId;
    try {
      if (isEditing) {
        planId = initialPlan.plan_id;
        console.log('Updating plan:', { planId, ...planData });
        await updatePlan(token, planId, planData);

        for (const day of days) {
          if (day.plan_day_id) {
            const originalDay = originalDays.find(d => d.plan_day_id === day.plan_day_id);
            if (originalDay && (day.day_number !== originalDay.day_number || day.note !== originalDay.note)) {
              console.log(`Updating day ${day.plan_day_id} with:`, { day_number: day.day_number, note: day.note });
              await updatePlanDay(token, planId, day.plan_day_id, { day_number: day.day_number, description: day.note });
            }

            const originalExercises = originalDay.exercises.map(ex => ex.plan_exercise_id);
            const currentExercises = day.exercises.map(ex => ex.plan_exercise_id || null);
            const exercisesToAdd = day.exercises.filter(ex => !ex.plan_exercise_id);
            const exercisesToRemove = originalExercises.filter(exId => !currentExercises.includes(exId));

            console.log('Original exercises:', originalExercises);
            console.log('Current exercises:', currentExercises);
            console.log('Exercises to remove:', exercisesToRemove);

            for (const ex of exercisesToAdd) {
              console.log(`Adding exercise ${ex.id} to day ${day.plan_day_id}`);
              await addExerciseToDay(token, planId, day.plan_day_id, { exercise_id: ex.id });
            }
            for (const exId of exercisesToRemove) {
              if (exId) {
                console.log('Attempting to remove exercise:', { planId, dayId: day.plan_day_id, exerciseId: exId });
                try {
                  await removeExerciseFromDay(token, planId, day.plan_day_id, exId);
                  console.log(`Successfully removed exercise ${exId} from day ${day.plan_day_id}`);
                } catch (error) {
                  console.error('Failed to remove exercise:', {
                    planId,
                    dayId: day.plan_day_id,
                    exerciseId: exId,
                    error: error.message || error,
                  });
                  throw new Error(`Failed to remove exercise ${exId} from day ${day.plan_day_id}`);
                }
              } else {
                console.warn('Skipping removal of undefined exercise ID for day:', day.plan_day_id);
              }
            }
          } else {
            console.log('Creating new day with:', { day_number: day.day_number, note: day.note });
            const createdDay = await createPlanDay(token, planId, { day_number: day.day_number, description: day.note });
            for (const ex of day.exercises) {
              console.log(`Adding exercise ${ex.id} to new day ${createdDay.plan_day_id}`);
              await addExerciseToDay(token, planId, createdDay.plan_day_id, { exercise_id: ex.id });
            }
          }
        }

        const deletedDays = originalDays.filter(od => !days.some(d => d.plan_day_id === od.plan_day_id));
        for (const deletedDay of deletedDays) {
          console.log(`Deleting day ${deletedDay.plan_day_id}`);
          await deletePlanDay(token, planId, deletedDay.plan_day_id);
        }
      } else {
        console.log('Creating new plan:', planData);
        const createdPlan = await createPlan(token, planData);
        planId = createdPlan.plan_id;

        try {
          for (const day of days) {
            if (!Number.isInteger(day.day_number) || day.day_number < 1) {
              console.error('Invalid day number:', day.day_number);
              throw new Error(`Invalid day_number: ${day.day_number}.`);
            }
            console.log('Creating day:', { day_number: day.day_number, note: day.note });
            const dayData = { day_number: day.day_number, description: day.note };
            const createdDay = await createPlanDay(token, planId, dayData);
            for (const exercise of day.exercises) {
              console.log(`Adding exercise ${exercise.id} to day ${createdDay.plan_day_id}`);
              await addExerciseToDay(token, planId, createdDay.plan_day_id, { exercise_id: exercise.id });
            }
          }
        } catch (error) {
          console.error('Rolling back plan creation due to error:', error.message || error);
          await deletePlan(token, planId);
          throw error;
        }
      }

      console.log('Plan saved successfully with ID:', planId);
      Alert.alert('Success', 'Plan saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save plan:', {
        planId,
        error: error.message || error,
        stack: error.stack,
      });
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  const deleteDay = (index) => {
    console.log('Prompting to delete day at index:', index);
    Alert.alert('Delete Day', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setDays(prevDays => prevDays.filter((_, i) => i !== index));
          console.log('Day deleted at index:', index);
        },
      },
    ]);
  };

  const deleteExercise = (dayIndex, exerciseIndex) => {
    console.log(`Deleting exercise at day ${dayIndex}, index ${exerciseIndex}`);
    setDays(prevDays =>
      prevDays.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              exercises: day.exercises.filter((_, exIndex) => exIndex !== exerciseIndex),
            }
          : day
      )
    );
  };

  const navigateToAddExercise = (dayIndex) => {
    console.log('Navigating to add exercise for day index:', dayIndex);
    navigation.navigate('FindWorkoutScreen', {
      onSelectExercise: (selectedExercise) => {
        setDays(prevDays =>
          prevDays.map((day, index) =>
            index === dayIndex
              ? {
                  ...day,
                  exercises: [...day.exercises, selectedExercise],
                }
              : day
          )
        );
        console.log('Exercise added to day:', dayIndex);
      },
    });
  };

  const addDay = () => {
    const newDayIndex = days.length + 1;
    console.log('Adding new day with number:', newDayIndex);
    setDays(prevDays => [
      ...prevDays,
      { day_number: newDayIndex, note: '', exercises: [] },
    ]);
  };

  const updateDayNote = (index, note) => {
    console.log(`Updating note for day ${index} to:`, note);
    setDays(prevDays =>
      prevDays.map((day, i) => (i === index ? { ...day, note } : day))
    );
  };

  const updateDayNumber = (index, text) => {
    const newDayNumber = parseInt(text, 10) || 1;
    console.log(`Updating day number for day ${index} to:`, newDayNumber);
    setDays(prevDays =>
      prevDays.map((day, i) =>
        i === index ? { ...day, day_number: newDayNumber } : day
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Edit Plan' : 'Create New Plan'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Plan Name"
        placeholderTextColor="#aaa"
        value={planName}
        onChangeText={setPlanName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        placeholderTextColor="#aaa"
        value={description}
        onChangeText={setDescription}
      />

      {days.map((day, dayIndex) => (
        <View key={dayIndex} style={styles.dayContainer}>
          <View style={styles.dayHeader}>
            <TextInput
              style={styles.dayNumberInput}
              placeholder="Day #"
              placeholderTextColor="#aaa"
              value={day.day_number.toString()}
              onChangeText={(text) => updateDayNumber(dayIndex, text)}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={() => deleteDay(dayIndex)}>
              <Icon name="trash-can" size={22} color="white" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Note (e.g., Pull Day)"
            placeholderTextColor="#aaa"
            value={day.note}
            onChangeText={(text) => updateDayNote(dayIndex, text)}
          />
          {day.exercises.map((exercise, exIndex) => (
            <TouchableOpacity
              key={exIndex}
              style={styles.exerciseItem}
              onPress={() => navigation.navigate('WorkoutDetailsScreen', { workoutId: exercise.id })}
            >
              <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />
              <Text style={styles.exerciseText}>{exercise.name}</Text>
              <TouchableOpacity
                onPress={() => deleteExercise(dayIndex, exIndex)}
                style={styles.deleteExerciseButton}
              >
                <Icon name="close" size={18} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => navigateToAddExercise(dayIndex)}
          >
            <Icon name="plus" size={18} color="white" />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addDayButton} onPress={addDay}>
        <Icon name="plus" size={20} color="white" />
        <Text style={styles.addDayText}>Add Day</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{isEditing ? 'Save Plan' : 'Create Plan'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  dayContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayNumberInput: {
    backgroundColor: '#333',
    color: 'white',
    padding: 8,
    borderRadius: 6,
    width: 80,
    fontSize: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  exerciseImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  exerciseText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  deleteExerciseButton: {
    paddingHorizontal: 8,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addExerciseText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
  addDayButton: {
    backgroundColor: '#0288D1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  addDayText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditPlanScreen;