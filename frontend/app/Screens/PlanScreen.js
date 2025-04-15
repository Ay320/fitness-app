import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { exercises } from './Exercises';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const samplePlans = [
  {
    id: 1,
    name: 'Full Body Plan',
    days: [
      {
        day: 'Monday',
        exercises: ['1', '2']
      },
      {
        day: 'Wednesday',
        exercises: ['3', '4']
      },
      {
        day: 'Friday',
        exercises: ['5']
      }
    ]
  }
];

const PlanScreen = () => {
  const navigation = useNavigation();
  const [expandedDays, setExpandedDays] = useState({});
  const [workoutPlans, setWorkoutPlans] = useState(samplePlans);

  const toggleDay = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDays(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderExerciseItem = (exerciseId) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return null;

    return (
      <TouchableOpacity
        key={exercise.id}
        style={styles.exerciseItem}
        onPress={() => navigation.navigate('SessionScreen', { id: exercise.id })}
      >
        <Text style={styles.exerciseText}>{exercise.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderDayItem = (plan, day, index) => (
    <View key={index} style={styles.dayContainer}>
      <TouchableOpacity onPress={() => toggleDay(index)} style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{day.day}</Text>
        <Icon name={expandedDays[index] ? 'chevron-up' : 'chevron-down'} size={24} color="white" />
      </TouchableOpacity>
      {expandedDays[index] && (
        <View style={styles.exerciseList}>
          {day.exercises.map(renderExerciseItem)}
        </View>
      )}
    </View>
  );

  const renderCurrentPlan = () => {
    if (workoutPlans.length === 0) {
      return (
        <View style={styles.noPlansContainer}>
          <Text style={styles.noPlansText}>You don't have any workout plans yet.</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('OtherPlansScreen')}
            style={styles.createPlanButton}
          >
            <Text style={styles.createPlanText}>Select a Workout Plan</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentPlan = workoutPlans[0];

    return (
      <View style={styles.planContainer}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Current Plan</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditPlanScreen')}
              style={styles.iconButton}
            >
              <Icon name="pencil" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setWorkoutPlans([])}
              style={styles.iconButton}
            >
              <Icon name="trash-can" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        {currentPlan.days.map((day, index) => renderDayItem(currentPlan, day, index))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderCurrentPlan()}
      <TouchableOpacity
        style={styles.otherPlansButton}
        onPress={() => navigation.navigate('OtherPlansScreen')}
      >
        <Text style={styles.otherPlansText}>Other Plans</Text>
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
  planContainer: {
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 12,
  },
  dayContainer: {
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  exerciseList: {
    marginTop: 10,
  },
  exerciseItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#333',
    borderRadius: 6,
    marginBottom: 6,
  },
  exerciseText: {
    color: 'white',
    fontSize: 16,
  },
  otherPlansButton: {
    backgroundColor: 'rgb(2, 77, 87)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  otherPlansText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noPlansContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noPlansText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 12,
  },
  createPlanButton: {
    backgroundColor: 'rgb(2, 77, 87)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  createPlanText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PlanScreen;
