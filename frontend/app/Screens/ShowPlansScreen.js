import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getPlans } from '../../src/api/plans';
import { AuthContext } from '../../src/AuthContext';
import { Ionicons } from '@expo/vector-icons'; 

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
  }, [token]);

  const handlePlanPress = (planId) => {
    navigation.navigate('ViewPlanScreen', { plan: planId });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="white"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noPlansText}>No workout plans available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Plans</Text>
      </View>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.plan_id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.planCard}
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
    backgroundColor: 'black',
  },
  header: {
    paddingTop: 60, 
    paddingBottom: 20,
    backgroundColor: 'black',
    alignItems: 'center', 
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    left: 20, 
    top: 20, 
    padding: 10,
    zIndex: 1, 
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noPlansText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
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
    marginBottom: 8,
  },
  planDescription: {
    color: 'gray',
    fontSize: 14,
  },
});

export default ShowPlansScreen;
