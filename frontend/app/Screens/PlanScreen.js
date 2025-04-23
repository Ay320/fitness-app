import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePlans } from '../../src/hooks/usePlans';
import PlanList from '../components/PlanList';

const PlanScreen = () => {
  const navigation = useNavigation();
  const { plans, loading, fetchUserPlans, handleGeneratePlan, handleSetActive } = usePlans();

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

    return <PlanList plans={plans} onSetActive={handleSetActive} />;
  };

  return (
    <ScrollView style={styles.container}>
      {renderCurrentPlan()}

      <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePlan}>
        <Text style={styles.buttonText}>Generate New Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.otherPlansButton} onPress={() => navigation.navigate('EditPlanScreen')}>
        <Text style={styles.buttonText}>Create New Plan</Text>
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
});

export default PlanScreen;
