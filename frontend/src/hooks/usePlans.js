import { useState, useEffect } from 'react';
import { getPlans, generatePlan, setPlanActive } from '../api/plans';
import { Alert } from 'react-native';

export const usePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = 'your_token_here';

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

  return { plans, loading, fetchUserPlans, handleGeneratePlan, handleSetActive };
};