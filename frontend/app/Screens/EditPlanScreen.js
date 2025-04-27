import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createPlan, updatePlan, createPlanDay, addExerciseToDay, deletePlan } from '../../src/api/plans';
import { AuthContext } from '../../src/AuthContext';

const EditPlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useContext(AuthContext);
  const isEditing = !!route.params?.plan;
  const initialPlan = route.params?.plan || { name: '', description: '', days: [] };

  const [planName, setPlanName] = useState(initialPlan.name);
  const [description, setDescription] = useState(initialPlan.description);
  const [days, setDays] = useState(initialPlan.days.map(day => ({ ...day, note: day.note || '' })));

  const handleSave = async () => {
    if (!planName.trim()) {
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
        await updatePlan(token, initialPlan.id, planData);
        planId = initialPlan.id;
      } else {
        const createdPlan = await createPlan(token, planData);
        planId = createdPlan.plan_id;

        // Add days and exercises, rollback if any step fails
        try {
          for (const day of days) {
            if (!Number.isInteger(day.day_number) || day.day_number < 1) {
              throw new Error(`Invalid day_number: ${day.day_number}. It must be a positive integer.`);
            }
            const dayData = {
              day_number: day.day_number,
              description: day.note || '',
            };
            const createdDay = await createPlanDay(token, planId, dayData);
            const dayId = createdDay.plan_day_id;

            for (const exercise of day.exercises) {
              const exerciseData = {
                exercise_id: exercise.id,
              };
              await addExerciseToDay(token, planId, dayId, exerciseData);
            }
          }
        } catch (error) {
          // If adding days or exercises fails, delete the newly created plan
          await deletePlan(token, planId);
          throw error;
        }
      }

      Alert.alert('Success', 'Plan saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save plan:', error);
      Alert.alert('Error', error.message || 'Something went wrong while saving the plan.');
    }
  };

  const deleteDay = (index) => {
    Alert.alert('Delete Day', 'Are you sure you want to delete this day?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedDays = [...days];
          updatedDays.splice(index, 1);
          setDays(updatedDays);
        },
      },
    ]);
  };

  const deleteExercise = (dayIndex, exerciseIndex) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setDays(updatedDays);
  };

  const navigateToAddExercise = (dayIndex) => {
    navigation.navigate('FindWorkoutScreen', {
      onSelectExercise: (selectedExercise) => {
        const updatedDays = [...days];
        updatedDays[dayIndex].exercises.push(selectedExercise);
        setDays(updatedDays);
      },
    });
  };

  const addDay = () => {
    const newDayIndex = days.length + 1;
    const newDay = {
      day_number: newDayIndex,
      note: '',
      exercises: [],
    };
    setDays([...days, newDay]);
  };

  const updateDayNote = (index, note) => {
    const updatedDays = [...days];
    updatedDays[index].note = note;
    setDays(updatedDays);
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
            <Text style={styles.dayTitle}>Day {day.day_number}</Text>
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
              onPress={() =>
                navigation.navigate('WorkoutDetailsScreen', {
                  workoutId: exercise.id,
                })
              }
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
        <Text style={styles.saveButtonText}>
          {isEditing ? 'Save Plan' : 'Create Plan'}
        </Text>
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
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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