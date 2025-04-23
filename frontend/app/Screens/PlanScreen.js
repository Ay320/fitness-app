import React, { useState, useEffect } from 'react';
import {View,Text,TouchableOpacity,StyleSheet,ScrollView,LayoutAnimation,Platform,UIManager,ActivityIndicator,Alert,} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { getPlans, generatePlan, setPlanActive } from '../../src/api/plans';
import { exercises } from './Exercises'; 

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PlanScreen = () => {
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [expandedDays, setExpandedDays] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('your_token_here');

  useEffect(() => {
    fetchUserPlans();
  }, []);

  const fetchUserPlans = async () => {
    try {
      const fetchedPlans = await getPlans(token);
      setPlans(fetchedPlans);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

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
      return <Text key={exerciseId} style={styles.unknownExercise}>Unknown Exercise (ID: {exerciseId})</Text>;
    }
    return (
      <TouchableOpacity
        key={exercise.id}
        onPress={() => navigation.navigate('SessionScreen', { id: exercise.id })}
        style={styles.exerciseItem}
      >
        <Text style={styles.exerciseText}>{exercise.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderDayItem = (plan, day) => {
    const key = `${plan.id}-${day.day}`;
    return (
      <View key={key} style={styles.dayContainer}>
        <TouchableOpacity
          onPress={() => toggleDay(key)}
          style={styles.dayHeader}
        >
          <Text style={styles.dayTitle}>{day.day}</Text>
          <Icon
            name={expandedDays[key] ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        {expandedDays[key] && (
          <View style={styles.exercisesList}>
            {day.exercises.map(renderExerciseItem)}
          </View>
        )}
      </View>
    );
  };

  const handleGeneratePlan = async () => {
    try {
      const generated = await generatePlan(token, {
        days_per_week: 3,
        plan_name: 'New AI Plan',
        description: 'Generated using preferences',
        preferences: {
          primary_muscles: ['chest', 'back'],
          equipment: ['dumbbell'],
        },
      });
      Alert.alert('Success', `Plan "${generated.name}" created!`);
      fetchUserPlans();
    } catch (err) {
      Alert.alert('Generation Error', err.message);
    }
  };

  const handleSetActive = async (planId) => {
    try {
      await setPlanActive(token, planId);
      Alert.alert('Active', 'Plan set as active!');
      fetchUserPlans();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const renderCurrentPlan = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />;
    }

    if (plans.length === 0) {
      return (
        <View style={styles.noPlansContainer}>
          <Text style={styles.noPlansText}>You don't have any workout plans yet.</Text>
          <Text style={styles.chooseOptionText}>Choose an option below</Text>
        </View>
      );
    }

    const currentPlan = plans[0];

    return (
      <View style={styles.planContainer}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Current Plan</Text>
          <View style={styles.planActions}>
            <TouchableOpacity onPress={() => navigation.navigate('EditPlanScreen', { plan: currentPlan })}>
              <Icon name="pencil" size={22} color="white" style={styles.iconMargin} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSetActive(currentPlan.plan_id)}>
              <Icon name="check-circle" size={22} color="lime" />
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

      <TouchableOpacity style={styles.generateButton} onPress={() => navigation.navigate("EditPlanScreen")}>
        <Text style={styles.buttonText}>Create New Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.otherPlansButton} onPress={() => navigation.navigate('OtherPlansScreen')}>
        <Text style={styles.buttonText}>Other Plans</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
  },
  planContainer: {
    marginBottom: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  planActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconMargin: {
    marginRight: 12,
  },
  dayContainer: {
    backgroundColor: '#222',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exercisesList: {
    marginTop: 10,
  },
  exerciseItem: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseText: {
    color: '#fff',
    fontSize: 14,
  },
  unknownExercise: {
    color: 'gray',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  generateButton: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  otherPlansButton: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noPlansContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  noPlansText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  chooseOptionText: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default PlanScreen;
