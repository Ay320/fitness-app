import React, { useState } from 'react';
import {View,Text,TouchableOpacity,StyleSheet,ScrollView,LayoutAnimation,Platform, UIManager,} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { exercises } from './Exercises';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const samplePlans = [
  
];

const PlanScreen = () => {
  const navigation = useNavigation();
  const [expandedDays, setExpandedDays] = useState({});
  const [workoutPlans, setWorkoutPlans] = useState(samplePlans);

  const toggleDay = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDays((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderExerciseItem = (exerciseId) => {
    const exercise = exercises.find((e) => e.id === exerciseId.toString());
    if (!exercise) {
      return (
        <Text key={exerciseId} style={styles.exerciseText}>
          Unknown Exercise (ID: {exerciseId})
        </Text>
      );
    }

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

  const renderDayItem = (plan, day) => {
    const key = `${plan.id}-${day.day}`;
    return (
      <View key={key} style={styles.dayContainer}>
        <TouchableOpacity onPress={() => toggleDay(key)} style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{day.day}</Text>
          <Icon name={expandedDays[key] ? 'chevron-up' : 'chevron-down'} size={24} color="white" />
        </TouchableOpacity>
        {expandedDays[key] && (
          <View style={styles.exerciseList}>
            {day.exercises.map(renderExerciseItem)}
          </View>
        )}
      </View>
    );
  };

  const renderCurrentPlan = () => {
    if (workoutPlans.length === 0) {
      return (
        <View style={styles.noPlansContainer}>
          <Text style={styles.noPlansText}>You don't have any workout plans yet.</Text>
          <Text style={styles.chooseOptionText}>Choose an option below</Text>
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
              onPress={() => navigation.navigate('EditPlanScreen', {plan: samplePlans[0]})}
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
        {currentPlan.days.map((day) => renderDayItem(currentPlan, day))}
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

      <TouchableOpacity
        style={styles.createNewPlanButton}
        onPress={() => navigation.navigate('EditPlanScreen')}
      >
        <Text style={styles.createNewPlanText}>Create New Plan</Text>
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
  createNewPlanButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  createNewPlanText: {
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
    marginBottom: 8,
  },
  chooseOptionText: {
    color: 'white',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default PlanScreen;
