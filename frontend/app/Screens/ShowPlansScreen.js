import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserPlans } from '../../src/api/plans'; // <-- you'll need to create this if not done
import { AuthContext } from '../../src/AuthContext';

const ShowPlansScreen = () => {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const userPlans = await getUserPlans(token);
        setPlans(userPlans);
      } catch (error) {
        console.error('Error fetching user plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noPlansText}>No plans available.</Text>
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
            style={styles.planCard}
            onPress={() => {
              // You can navigate somewhere with plan details if you want
              // navigation.navigate('PlanDetailsScreen', { plan: item });
            }}
          >
            <Text style={styles.planName}>{item.plan_name}</Text>
            <Text style={styles.planInfo}>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
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
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  noPlansText: {
    color: 'white',
    fontSize: 18,
  },
  planCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  planName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planInfo: {
    color: 'gray',
    fontSize: 14,
  },
});

export default ShowPlansScreen;
