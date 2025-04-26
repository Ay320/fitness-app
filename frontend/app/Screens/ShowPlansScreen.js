import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getPlans } from '../../src/api/plans';
import { AuthContext } from '../../src/AuthContext';

const ShowPlansScreen = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await getPlans(token);
        setPlans(fetchedPlans);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        setError('Failed to fetch workout plans. Please try again later.'); 
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  },);

  const handlePlanPress = (planId) => {
    navigation.navigate('ViewPlanScreen', { plan: planId });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No workout plans available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.plan_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePlanPress(item.plan_id)}
          >
            <Text style={styles.planName}>{item.name}</Text>
            <Text style={styles.planDescription}>
              {item.description ? item.description : 'No description available'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default ShowPlansScreen;
