import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Alert,Image,} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createPlan, updatePlan } from '../../src/api/plans';

const EditPlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isEditing = !!route.params?.plan;
  const initialPlan = route.params?.plan || { name: '', days: [] };

  const [planName, setPlanName] = useState(initialPlan.name);
  const [days, setDays] = useState(initialPlan.days);

  const handleSave = async () => {
    if (!planName.trim()) {
      Alert.alert('Validation Error', 'Plan name cannot be empty.');
      return;
    }

    const updatedPlan = { name: planName, days };

    console.log('Plan to be created:', updatedPlan);

    try {
      if (isEditing) {
        await updatePlan(initialPlan.id, updatedPlan);
        console.log('Updated plan:', updatedPlan);
      } else {
        await createPlan(updatedPlan);
        console.log('New plan:', updatedPlan);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save plan:', error.response || error.message || error);
      Alert.alert('Error', 'Something went wrong while saving the plan.');
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

  const addExerciseToDay = (dayIndex) => {
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
      day: `Day ${newDayIndex}`,
      exercises: [],
    };
    setDays([...days, newDay]);
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

      {days.map((day, dayIndex) => (
        <View key={dayIndex} style={styles.dayContainer}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayTitle}>{day.day}</Text>
            <TouchableOpacity onPress={() => deleteDay(dayIndex)}>
              <Icon name="trash-can" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {day.exercises.map((exercise, exIndex) => (
            <TouchableOpacity
              key={exIndex}
              style={styles.exerciseItem}
              onPress={() =>
                navigation.navigate('WorkoutDetailsScreen', {
                  workoutId: exercise.id, // Pass the workout ID to the details screen
                })
              }
            >
              {/* Display the exercise image */}
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
            onPress={() => addExerciseToDay(dayIndex)}
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