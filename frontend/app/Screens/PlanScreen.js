import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getPlans, generatePlan, setPlanActive } from '../api/plans';
import { useNavigation } from '@react-navigation/native';

const PlansScreen = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('your_token_here'); 
  const navigation = useNavigation();

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

  const goToPlanDetails = (planId) => {
    navigation.navigate('PlanDetails', { planId });
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Your Plans</Text>

      <Button title="Generate New Plan" onPress={handleGeneratePlan} />

      <FlatList
        data={plans}
        keyExtractor={(item) => item.plan_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 15,
              marginVertical: 10,
              borderWidth: 1,
              borderRadius: 8,
              backgroundColor: item.is_active ? '#d4edda' : '#f8f9fa',
            }}
            onPress={() => goToPlanDetails(item.plan_id)}
            onLongPress={() => handleSetActive(item.plan_id)}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>Days/Week: {item.days_per_week}</Text>
            {item.is_active && <Text style={{ color: 'green' }}>Active</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
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
