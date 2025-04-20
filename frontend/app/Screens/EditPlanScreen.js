import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,FlatList,StyleSheet,Alert,ScrollView,} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EditPlanScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { plan } = route.params;

  const [planName, setPlanName] = useState(plan.name);
  const [days, setDays] = useState(plan.days);

  const updateDayName = (index, newDayName) => {
    const updated = [...days];
    updated[index].day = newDayName;
    setDays(updated);
  };

  const removeDay = (index) => {
    Alert.alert(
      'Remove Day',
      `Are you sure you want to remove ${days[index].day}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            const updated = [...days];
            updated.splice(index, 1);
            setDays(updated);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const removeExercise = (dayIndex, exerciseIndex) => {
    const updated = [...days];
    updated[dayIndex].exercises.splice(exerciseIndex, 1);
    setDays(updated);
  };

  const addDay = () => {
    setDays([...days, { day: `New Day ${days.length + 1}`, exercises: [] }]);
  };

  const saveChanges = () => {
    const updatedPlan = {
      ...plan,
      name: planName,
      days,
    };

    //Update plans using API
    console.log('Updated plan:', updatedPlan);
    Alert.alert('Saved!', 'Your plan has been updated.');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Plan Name</Text>
      <TextInput
        value={planName}
        onChangeText={setPlanName}
        placeholder="Enter plan name"
        style={styles.input}
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Workout Days</Text>
      {days.map((day, index) => (
        <View key={index} style={styles.dayContainer}>
          <View style={styles.dayHeader}>
            <TextInput
              value={day.day}
              onChangeText={(text) => updateDayName(index, text)}
              style={styles.dayInput}
              placeholder="Day Name"
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={() => removeDay(index)}>
              <Icon name="trash-can" size={20} color="#ff4d4d" />
            </TouchableOpacity>
          </View>

          {day.exercises.length === 0 ? (
            <Text style={styles.noExerciseText}>No exercises</Text>
          ) : (
            day.exercises.map((exId, exIndex) => (
              <View key={exIndex} style={styles.exerciseRow}>
                <Text style={styles.exerciseText}>Exercise ID: {exId}</Text>
                <TouchableOpacity onPress={() => removeExercise(index, exIndex)}>
                  <Icon name="close" size={18} color="#ff4d4d" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addDay}>
        <Text style={styles.addButtonText}>+ Add Day</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    padding: 20,
    flex: 1,
  },
  label: {
    color: 'white',
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  dayContainer: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInput: {
    color: 'white',
    fontSize: 16,
    borderBottomColor: '#444',
    borderBottomWidth: 1,
    flex: 1,
    marginRight: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  exerciseText: {
    color: 'white',
  },
  noExerciseText: {
    color: '#aaa',
    marginTop: 6,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 14,
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
