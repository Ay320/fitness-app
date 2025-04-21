import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditPlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isEditing = !!route.params?.plan;
  const initialPlan = route.params?.plan || { name: '', days: [] };

  const [planName, setPlanName] = useState(initialPlan.name);
  const [days, setDays] = useState(initialPlan.days);

  const handleSave = () => {
    const updatedPlan = { name: planName, days };
    console.log(isEditing ? 'Updated plan:' : 'New plan:', updatedPlan);
    navigation.goBack();
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
    navigation.navigate('WorkoutDetailsScreen', {
      workoutId: '1', // You can set this to any valid default exercise ID
      onSelectExercise: (selectedExerciseId) => {
        const updatedDays = [...days];
        updatedDays[dayIndex].exercises.push(selectedExerciseId);
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

          {day.exercises.map((exerciseId, exIndex) => (
            <View key={exIndex} style={styles.exerciseItem}>
              <Text style={styles.exerciseText}>Exercise ID: {exerciseId}</Text>
              <TouchableOpacity
                onPress={() => deleteExercise(dayIndex, exIndex)}
                style={styles.deleteExerciseButton}
              >
                <Icon name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>
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
  },
  exerciseText: {
    color: 'white',
    fontSize: 16,
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
