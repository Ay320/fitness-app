import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DayItem from './DayItem';

const PlanList = ({ plans, onSetActive }) => {
  const currentPlan = plans[0];

  return (
    <View style={styles.planContainer}>
      <View style={styles.planHeader}>
        <Text style={styles.planTitle}>Current Plan</Text>
        <View style={styles.planActions}>
          <TouchableOpacity>
            <Icon name="pencil" size={22} color="white" style={styles.iconMargin} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSetActive(currentPlan.plan_id)}>
            <Icon name="check-circle" size={22} color="lime" />
          </TouchableOpacity>
        </View>
      </View>

      {currentPlan.days.map((day) => (
        <DayItem key={day.day} day={day} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default PlanList;