import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditPlanScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { plan } = route.params;

  const [planName, setPlanName] = useState(plan[0].name);
  const [days, setDays] = useState(plan[0].days);

  const handleAddExercise = (dayIndex) => {
    const updated = [...days];
    updated[dayIndex].exercises.push('1'); // Add placeholder exercise
    setDays(updated);
  };

  const handleRemoveExercise = (dayIndex, exerciseIndex) => {
    const updated = [...days];
    updated[dayIndex].exercises.splice(exerciseIndex, 1);
    setDays(updated);
  };

  const handleSave = () => {
    const updatedPlan = {
      ...plan[0],
      name: planName,
      days: days,
    };

    console.log('Updated Plan:', updatedPlan);
    // Later: Send to backend or store

    navigation.goBack(); // Go back to PlanScreen
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Workout Plan</Text>

      <Text style={styles.label}>Plan Name</Text>
      <TextInput
        value={planName}
        onChangeText={setPlanName}
        style={styles.input}
        placeholder="Enter Plan Name"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Edit Days</Text>
      {days.map((day, dayIndex) => (
        <View key={dayIndex} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{day.day}</Text>

          {day.exercises.length === 0 && (
            <Text style={styles.noExercise}>No exercises yet.</Text>
          )}

          {day.exercises.map((exId, exIndex) => (
            <View key={exIndex} style={styles.exerciseRow}>
              <Text style={styles.exerciseText}>Exercise ID: {exId}</Text>
              <TouchableOpacity onPress={() => handleRemoveExercise(dayIndex, exIndex)}>
                <Icon name="close" size={20} color="#ff4d4d" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => handleAddExercise(dayIndex)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  label: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#222',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  dayContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  dayTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noExercise: {
    color: 'gray',
    fontStyle: 'italic',
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  exerciseText: {
    color: 'white',
  },
  addButton: {
    marginTop: 10,
    backgroundColor: '#333',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#00ccff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditPlanScreen;
